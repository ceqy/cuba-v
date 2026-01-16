<script lang="ts" setup>
import type { ExecutePaymentRunRequest } from '#/api/finance';

import { onMounted, ref } from 'vue';

import { Page, useVbenForm } from '@vben/common-ui';

import {
  Button,
  Card,
  Col,
  message,
  Progress,
  Result,
  Row,
  Statistic,
} from 'ant-design-vue';

import { executePaymentRun } from '#/api/finance';

defineOptions({ name: 'TRPaymentRun' });

// ============================================================================
// 状态管理
// ============================================================================
const loading = ref(false);
const executionResult = ref<any>(null);
const bankBalances = ref<any[]>([]);

// ============================================================================
// 表单配置
// ============================================================================
const [Form, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 120,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      fieldName: 'run_id',
      label: '运行 ID',
      component: 'Input',
      defaultValue: `PAY-${new Date().toISOString().slice(0, 10)}`,
      rules: 'required',
      colProps: { span: 12 },
    },
    {
      fieldName: 'posting_date',
      label: '过账日期',
      component: 'DatePicker',
      defaultValue: new Date(),
      rules: 'required',
      colProps: { span: 12 },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      fieldName: 'company_codes',
      label: '公司代码',
      component: 'Select',
      defaultValue: ['1000'],
      componentProps: {
        mode: 'multiple',
        options: [
          { label: '1000 (总部)', value: '1000' },
          { label: '2000 (分部)', value: '2000' },
        ],
      },
      rules: 'required',
      colProps: { span: 24 },
    },
    {
      fieldName: 'payment_methods',
      label: '支付方式',
      component: 'CheckboxGroup',
      defaultValue: ['T'],
      componentProps: {
        options: [
          { label: '电汇 (T)', value: 'T' },
          { label: '支票 (C)', value: 'C' },
        ],
      },
    },
  ],
  showActionButtonGroup: false,
});

// ============================================================================
// 银行余额加载
// ============================================================================
async function loadBankBalances() {
  try {
    // 模拟数据展示
    bankBalances.value = [
      {
        bank: '招商银行',
        account: '****1234',
        currency: 'CNY',
        balance: 5_000_000,
      },
      {
        bank: 'Citi Bank',
        account: '****5678',
        currency: 'USD',
        balance: 120_000,
      },
    ];
  } catch (error) {
    console.error('Failed to load bank balances:', error);
  }
}

onMounted(() => {
  loadBankBalances();
});

// ============================================================================
// 操作处理
// ============================================================================
async function handleExecute() {
  try {
    await formApi.validate();
    const values = await formApi.getValues();
    loading.value = true;
    executionResult.value = null;

    const requestData: ExecutePaymentRunRequest = {
      run_id: values.run_id,
      posting_date: values.posting_date, // DatePicker with valueFormat returns string
      parameters: {
        company_codes: values.company_codes,
        payment_methods: values.payment_methods,
      },
    };
    const res = await executePaymentRun(requestData);

    // 模拟进度条动画
    await new Promise((resolve) => setTimeout(resolve, 1500));

    executionResult.value = res;
    message.success('付款运行已提交');
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Page title="自动付款运行中心">
    <div class="p-4">
      <!-- 顶部：银行余额概览 -->
      <Row :gutter="16" class="mb-4">
        <Col :span="8" v-for="(item, index) in bankBalances" :key="index">
          <Card size="small" :title="item.bank">
            <Statistic
              :value="item.balance"
              :precision="2"
              :suffix="item.currency"
              :value-style="{ color: '#3f8600' }"
            />
            <div class="mt-1 text-xs text-gray-500">
              账户: {{ item.account }}
            </div>
          </Card>
        </Col>
      </Row>
      <Row :gutter="16">
        <!-- 左侧：参数配置 -->
        <Col :span="12">
          <Card title="运行参数" :bordered="false">
            <Form />
            <div class="mt-4 text-right">
              <Button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleExecute"
              >
                执行付款
              </Button>
            </div>
          </Card>
        </Col>
        <!-- 右侧：执行状态 -->
        <Col :span="12">
          <Card title="运行监控" :bordered="false" class="h-full">
            <div
              v-if="!executionResult && !loading"
              class="py-12 text-center text-gray-400"
            >
              等待执行...
            </div>
            <div v-else-if="loading" class="py-12 text-center">
              <Progress type="circle" :percent="75" status="active" />
              <p class="mt-4">正在处理付款建议...</p>
            </div>
            <div v-else>
              <Result
                status="success"
                title="付款运行完成"
                :sub-title="`Job ID: ${executionResult.job_id}`"
              >
                <template #extra>
                  <Button type="primary">查看 GL 凭证</Button>
                  <Button>下载付款建议书</Button>
                </template>

                <div
                  class="desc rounded bg-gray-50 p-4 text-left dark:bg-gray-700"
                >
                  <p><strong>状态:</strong> {{ executionResult.status }}</p>
                  <p>
                    <strong>进度:</strong>
                    {{ executionResult.progress_percentage }}%
                  </p>
                </div>
              </Result>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style scoped>
.h-full {
  height: 100%;
}
</style>
