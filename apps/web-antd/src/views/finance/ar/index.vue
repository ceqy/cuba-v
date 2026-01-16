<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { Page, useVbenModal } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Button, Tag, message } from 'ant-design-vue';
import { Plus } from 'lucide-vue-next';
import { listCustomers } from '#/api/finance';
import CustomerModal from './components/CustomerModal.vue';

defineOptions({ name: 'ARCustomerManagement' });

const [CustomerModalReg, customerModalApi] = useVbenModal({
  connectedComponent: CustomerModal,
});

// Configure VxeGrid Columns
const columns: VxeTableGridOptions['columns'] = [
  {
    field: 'customer_id',
    title: '客户 ID',
    minWidth: 120,
    sortable: true,
  },
  {
    field: 'name',
    title: '客户名称',
    minWidth: 200,
  },
  {
    field: 'account_group',
    title: '账户组',
    width: 120,
    slots: { default: 'account_group' },
  },
  {
    field: 'reconciliation_account',
    title: '统驭科目',
    width: 120,
  },
  {
    field: 'company_code',
    title: '公司代码',
    width: 100,
  },
  {
    title: '操作',
    width: 120,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'company_code',
        label: '公司代码',
        defaultValue: '1000',
      },
      {
        component: 'Input',
        fieldName: 'customer_id',
        label: '客户ID',
      },
    ],
  },
  gridOptions: {
    columns,
    height: 'auto',
    pagerConfig: {
      enabled: true,
      pageSize: 20,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          try {
            const res = await listCustomers({
              company_code: formValues.company_code,
              page: page.currentPage,
              page_size: page.pageSize,
            });
            // Handle different response structures gracefully
            const items = res.items || res.customers || [];
            const total = Number(res.pagination?.total_items || items.length || 0);
            return { items, total };
          } catch (error) {
            console.error(error);
            return { items: [], total: 0 };
          }
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      search: true,
    },
  },
});

function handleAdd() {
  customerModalApi.open();
}

function handleSuccess() {
  gridApi.reload();
}

function handleEdit(row: any) {
  // Logic mostly same as create but pre-filling data would require modal update
  message.info(`Edit customer ${row.customer_id} not implemented yet.`);
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="handleAdd">
          <template #icon><Plus class="w-4 h-4" /></template>
          新建客户
        </Button>
      </template>

      <template #account_group="{ row }">
         <Tag color="green">{{ row.account_group }}</Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" size="small" @click="handleEdit(row)">编辑</Button>
      </template>
    </Grid>
    <CustomerModalReg @success="handleSuccess" />
  </Page>
</template>
