<script lang="ts" setup>
import type { ExecuteAllocationRequest } from '#/api/finance';

import { ref } from 'vue';

import { Page, useVbenForm } from '@vben/common-ui';
import { Button, Card, message, Result, Steps } from 'ant-design-vue';

import {
  executeActivityAllocation,
  executeCostAllocation,
} from '#/api/finance';

defineOptions({ name: 'COAllocationExecute' });
// ============================================================================
// 状态管理
// ============================================================================
const currentStep = ref(0);
const loading = ref(false);
const executionResult = ref<any>(null);
// ============================================================================
// 表单配置
// ============================================================================
const [Form, formApi] = useVbenForm({
  labelWidth: 120,
  schema: [
    {
      fieldName: 'allocation_type',
      label: '分配类型',
      component: 'RadioGroup',
      defaultValue: 'cost_center',
      componentProps: {
        options: [
          { label: '成本中心分摊 (Assessment)', value: 'cost_center' },
          { label: '作业确认 (Activity)', value: 'activity' },
        ],
      },
      rules: 'required',
    },
    {
      fieldName: 'controlling_area',
      label: '控制范围',
      component: 'Input',
      defaultValue: '1000',
      rules: 'required',
    },
    {
      fieldName: 'allocation_cycle',
      label: '分配循环',
      component: 'Input',
      defaultValue: 'Q1-2026',
      rules: 'required',
      helpMessage: '输入要在本次运行中处理的循环名称',
    },
    {
      fieldName: 'fiscal_year',
      label: '会计年度',
      component: 'InputNumber',
      defaultValue: 2026,
      rules: 'required',
    },
    {
      fieldName: 'fiscal_period',
      label: '会计期间',
      component: 'InputNumber',
      defaultValue: 1,
      rules: 'required',
      componentProps: { min: 1, max: 12 },
    },
    {
      fieldName: 'test_run',
      label: '测试运行',
      component: 'Switch',
      defaultValue: true,
      helpMessage: '开启测试运行将不会生成实际的 GL 凭证',
    },
  ],
  showActionButtonGroup: false,
});
// ============================================================================
// 操作处理
// ============================================================================
async function handleExecute() {
  try {
    await formApi.validate();
    const values = await formApi.getValues();
    loading.value = true;

    const requestData: ExecuteAllocationRequest = {
      controlling_area: values.controlling_area,
      fiscal_year: values.fiscal_year,
      fiscal_period: values.fiscal_period,
      allocation_cycle: values.allocation_cycle,
      test_run: values.test_run,
    };
    
    let res;
    if (values.allocation_type === 'activity') {
        res = await executeActivityAllocation(requestData);
    } else {
        res = await executeCostAllocation(requestData);
    }
    
    executionResult.value = res;
    currentStep.value = 1;
    message.success('分配运行已完成');
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  currentStep.value = 0;
  executionResult.value = null;
  formApi.resetValues();
}

// Helpers for result view
function getResultValue(key: string) {
    return formApi.form.values[key];
}
</script>

<template>
  <Page title="成本/作业分配执行">
    <div class="mb-4 bg-white dark:bg-gray-800 p-4 rounded-md">
      <Steps
        :current="currentStep"
        :items="[
          { title: '参数设置', description: '配置分配运行参数' },
          { title: '执行结果', description: '查看运行日志' },
        ]"
      />
    </div>
    <div class="p-4">
      <!-- 步骤 1: 参数设置 -->
      <Card v-show="currentStep === 0" title="运行参数">
        <Form />
        <div class="mt-8 text-center">
          <Button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleExecute"
          >
            开始执行
          </Button>
        </div>
      </Card>
      
      <!-- 步骤 2: 执行结果 -->
      <Card v-show="currentStep === 1" title="执行报告">
        <Result
          status="success"
          title="分配运行成功完成"
          :sub-title="`运行ID: ${executionResult?.run_id || 'N/A'}`"
        >
          <template #extra>
            <Button type="primary" @click="handleReset">再次运行</Button>
            <Button>查看生成的凭证</Button>
          </template>

          <div class="desc bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-md">
            <p class="text-lg font-bold mb-4">
              <strong>本次运行详情:</strong>
            </p>
            <p>是否测试运行: {{ getResultValue('test_run') ? '是' : '否' }}</p>
            <p>控制范围: {{ getResultValue('controlling_area') }}</p>
            <p>循环: {{ getResultValue('allocation_cycle') }}</p>
          </div>
        </Result>
      </Card>
    </div>
  </Page>
</template>

<style scoped>
.desc {
  padding: 24px;
}
</style>
