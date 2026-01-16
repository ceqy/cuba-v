<script lang="ts" setup>
import type { OAuthClientApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal as AntModal } from 'ant-design-vue';

import { deleteOAuthClientApi, getOAuthClientsApi } from '#/api';
import { $t } from '#/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { useColumns, useSearchFormSchema } from './data';
import ClientForm from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: ClientForm,
});

// 存储所有客户端数据（用于前端分页和搜索）
const allClients = ref<OAuthClientApi.Client[]>([]);
const isLoaded = ref(false);

// 加载所有客户端数据
async function loadAllClients() {
  try {
    const result = await getOAuthClientsApi();
    allClients.value = result.clients || [];
  } catch (error: any) {
    console.error('Failed to fetch OAuth clients:', error);
    message.error(`加载客户端列表失败: ${error.message || '未知错误'}`);
    allClients.value = [];
  } finally {
    isLoaded.value = true;
  }
}

// 前端过滤和分页
function filterAndPaginate(
  page: { currentPage: number; pageSize: number },
  formValues: Record<string, any>,
) {
  let filtered = [...allClients.value];

  // 按名称搜索
  if (formValues?.name) {
    const searchName = formValues.name.toLowerCase();
    filtered = filtered.filter((client) =>
      client.name.toLowerCase().includes(searchName),
    );
  }

  const total = filtered.length;
  const start = (page.currentPage - 1) * page.pageSize;
  const end = start + page.pageSize;
  const items = filtered.slice(start, end);

  return { items, total };
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: false,
    schema: useSearchFormSchema(),
    showCollapseButton: false,
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
    },
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 如果还没有加载数据，先加载
          if (!isLoaded.value) {
            await loadAllClients();
          }
          return filterAndPaginate(page, formValues);
        },
      },
      response: {
        result: 'items',
        total: 'total',
        list: 'items',
      },
    },
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      resizable: true,
      search: true,
      zoom: true,
    },
  },
});

onMounted(() => {
  loadAllClients();
});

function handleAdd() {
  formDrawerApi.setData({});
  formDrawerApi.open();
}

function handleEdit(row: OAuthClientApi.Client) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

async function handleSuccess() {
  // 重新加载所有数据并刷新表格
  isLoaded.value = false;
  await loadAllClients();
  await gridApi.reload();
}

function handleDelete(row: OAuthClientApi.Client) {
  AntModal.confirm({
    title: $t('common.deleteConfirm'),
    content: $t('ui.actionMessage.deleteConfirm', [row.name]),
    onOk: async () => {
      try {
        await deleteOAuthClientApi(row.client_id);
        message.success($t('common.deleteSuccess'));
        await handleSuccess();
      } catch (error: any) {
        console.error(error);
        if (error?.response?.status === 403) {
          message.error($t('common.noPermission') || '没有权限执行此操作');
        } else {
          message.error(error.message || $t('common.error'));
        }
      }
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="OAuth2 客户端列表">
      <template #toolbar-tools>
        <Button type="primary" @click="handleAdd">
          <Plus class="mr-1 size-4" />
          {{ $t('common.add') }}
        </Button>
      </template>
      <template #action="{ row }">
        <Button type="link" @click="handleEdit(row)">{{ $t('common.edit') }}</Button>
        <Button danger type="link" @click="handleDelete(row)">{{ $t('common.delete') }}</Button>
      </template>
    </Grid>
    <FormDrawer @success="handleSuccess" />
  </Page>
</template>
