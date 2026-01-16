<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { JournalEntryListItem } from '#/api/finance';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Button, message, Modal, Popconfirm, Tag } from 'ant-design-vue';
import { Plus } from 'lucide-vue-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  JournalEntryStatus,
  listJournalEntries,
  postJournalEntry,
  reverseJournalEntry,
} from '#/api/finance';

import JournalDrawer from './modules/journal-drawer.vue';
import JournalLineItems from './modules/journal-line-items.vue';

defineOptions({ name: 'GLJournalEntryManagement' });

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: JournalDrawer,
});

// Columns Definition
const columns: VxeTableGridOptions['columns'] = [
  { type: 'expand', width: 60, slots: { content: 'expand_content' } },
  {
    field: 'document_reference.document_number',
    title: '凭证编号',
    minWidth: 160,
    sortable: true,
  },
  {
    field: 'document_date',
    title: '凭证日期',
    width: 120,
    formatter: 'formatDate',
  },
  {
    field: 'posting_date',
    title: '过账日期',
    width: 120,
    formatter: 'formatDate',
  },
  {
    field: 'document_reference.company_code',
    title: '公司代码',
    width: 100,
  },
  {
    field: 'header_text',
    title: '摘要',
    minWidth: 200,
  },
  {
    field: 'status',
    title: '状态',
    width: 120,
    slots: { default: 'status' },
  },
  {
    title: '操作',
    width: 180,
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
        component: 'InputNumber',
        componentProps: {
          min: 1900,
          max: 2099,
        },
        fieldName: 'fiscal_year',
        label: '会计年度',
        defaultValue: 2026,
      },
      {
        component: 'Input',
        fieldName: 'document_number',
        label: '凭证编号',
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
    expandConfig: {
      expandAll: false,
      padding: false,
      accordion: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          try {
            const response = await listJournalEntries({
              company_code: formValues.company_code,
              fiscal_year: formValues.fiscal_year,
              page: page.currentPage,
              page_size: page.pageSize,
            });

            return {
              items: response.entries || [],
              total: Number(response.pagination?.total_items || 0),
            };
          } catch (error: any) {
            message.error(`Failed to load journal entries: ${error.message}`);
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
  drawerApi.open();
}

function handleSuccess() {
  gridApi.reload();
}

function getStatusColor(status: JournalEntryStatus) {
  switch (status) {
    case JournalEntryStatus.POSTED:
      return 'green';
    case JournalEntryStatus.REVERSED:
      return 'red';
    case JournalEntryStatus.PENDING:
      return 'blue';
    default:
      return 'orange';
  }
}

function getStatusText(status: JournalEntryStatus) {
  const map: Record<string, string> = {
    JOURNAL_ENTRY_STATUS_DRAFT: '草稿',
    JOURNAL_ENTRY_STATUS_PENDING: '待审批',
    JOURNAL_ENTRY_STATUS_POSTED: '已过账',
    JOURNAL_ENTRY_STATUS_REVERSED: '已冲销',
  };
  return map[status] || status;
}

async function handleAction(
  type: 'post' | 'reverse',
  row: JournalEntryListItem,
) {
  const docNum = row.document_reference.document_number;
  if (type === 'post') {
    const entryId = `${row.document_reference.company_code}-${docNum}-${row.document_reference.fiscal_year}`;
    try {
      await postJournalEntry(entryId);
      message.success('已过账');
      gridApi.reload();
    } catch (e: any) {
      message.error(e.message);
    }
  } else if (type === 'reverse') {
    const entryId = `${row.document_reference.company_code}-${docNum}-${row.document_reference.fiscal_year}`;
    try {
      await reverseJournalEntry(entryId, {
        reversal_date: new Date().toISOString().split('T')[0],
      });
      message.success('已冲销');
      gridApi.reload();
    } catch (e: any) {
      message.error(e.message);
    }
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="handleAdd">
          <template #icon><Plus class="w-4 h-4" /></template>
          新建凭证
        </Button>
      </template>

      <template #status="{ row }">
        <Tag :color="getStatusColor(row.status)">
          {{ getStatusText(row.status) }}
        </Tag>
      </template>

      <template #action="{ row }">
        <div class="space-x-2">
          <Button
            type="link"
            size="small"
            @click="
              message.info(
                '查看详情: ' + row.document_reference.document_number,
              )
            "
          >
            查看
          </Button>

          <Popconfirm
            v-if="row.status === JournalEntryStatus.DRAFT"
            title="确认过账?"
            @confirm="handleAction('post', row)"
          >
            <Button type="link" size="small">过账</Button>
          </Popconfirm>

          <Popconfirm
            v-if="row.status === JournalEntryStatus.POSTED"
            title="确认冲销?"
            @confirm="handleAction('reverse', row)"
          >
            <Button type="link" danger size="small">冲销</Button>
          </Popconfirm>
        </div>
      </template>

      <template #expand_content="{ row }">
        <JournalLineItems
          :entry-id="`${row.document_reference.company_code}-${row.document_reference.document_number}-${row.document_reference.fiscal_year}`"
        />
      </template>
    </Grid>
    <Drawer @success="handleSuccess" />
  </Page>
</template>
