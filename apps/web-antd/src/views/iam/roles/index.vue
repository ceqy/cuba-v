<script lang="ts" setup>
import type { RoleApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal as AntModal } from 'ant-design-vue';

import { deleteRoleApi, getRolesApi } from '#/api';
import { $t } from '#/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { useColumns, useSearchFormSchema } from './data';
import PermissionsDrawer from './modules/permissions-drawer.vue';
import RoleForm from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: RoleForm,
});

const [PermDrawer, permDrawerApi] = useVbenDrawer({
  connectedComponent: PermissionsDrawer,
});

// 存储所有角色数据（用于前端分页和搜索）
const allRoles = ref<RoleApi.Role[]>([]);
const isLoaded = ref(false);

// 加载所有角色数据
async function loadAllRoles() {
  try {
    const result = await getRolesApi({ page_size: 1000 });
    allRoles.value = result.roles || [];
  } catch (error: any) {
    console.error('Failed to fetch roles:', error);
    message.error(`加载角色列表失败: ${error.message || '未知错误'}`);
    allRoles.value = [];
  } finally {
    isLoaded.value = true;
  }
}

// 前端过滤和分页
function filterAndPaginate(
  page: { currentPage: number; pageSize: number },
  formValues: Record<string, any>,
) {
  let filtered = [...allRoles.value];

  // 按名称搜索
  if (formValues?.name) {
    const searchName = formValues.name.toLowerCase();
    filtered = filtered.filter((role) =>
      role.name.toLowerCase().includes(searchName),
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
            await loadAllRoles();
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
  loadAllRoles();
});

function handleAdd() {
  formDrawerApi.setData({});
  formDrawerApi.open();
}

function handleEdit(row: RoleApi.Role) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

function handleAssignPermissions(row: RoleApi.Role) {
  permDrawerApi.setData(row);
  permDrawerApi.open();
}

async function handleSuccess() {
  // 重新加载所有数据并刷新表格
  isLoaded.value = false;
  await loadAllRoles();
  await gridApi.reload();
}

function handleDelete(row: RoleApi.Role) {
  // 系统角色不可删除
  if (row.is_immutable) {
    message.warning($t('iam.role.cannot_delete_immutable') || '系统角色不可删除');
    return;
  }

  AntModal.confirm({
    title: $t('common.deleteConfirm'),
    content: $t('ui.actionMessage.deleteConfirm', [row.name]),
    onOk: async () => {
      try {
        await deleteRoleApi(row.role_id);
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
    <Grid table-title="角色列表">
      <template #toolbar-tools>
        <Button type="primary" @click="handleAdd">
          <Plus class="mr-1 size-4" />
          {{ $t('common.add') }}
        </Button>
      </template>
      <template #action="{ row }">
        <Button type="link" @click="handleEdit(row)">{{ $t('common.edit') }}</Button>
        <Button type="link" @click="handleAssignPermissions(row)">权限</Button>
        <Button danger type="link" @click="handleDelete(row)">{{ $t('common.delete') }}</Button>
      </template>
    </Grid>
    <FormDrawer @success="handleSuccess" />
    <PermDrawer @success="handleSuccess" />
  </Page>
</template>
