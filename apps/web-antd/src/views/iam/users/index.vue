<script lang="ts" setup>
import type { UserApi } from '#/api';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal as AntModal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUserApi, getUserListApi } from '#/api';
import { $t } from '#/locales';

import { useColumns, useSearchFormSchema } from './data';
import UserForm from './modules/form.vue';

// 使用 Modal 连接用户表单组件
const [UserFormModal, userFormModalApi] = useVbenModal({
  connectedComponent: UserForm,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useSearchFormSchema(),
  },
  gridOptions: {
    columns: useColumns(),
    keepSource: true,
    height: 'auto',
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          { page }: { page: { currentPage: number; pageSize: number } },
          formValues: any,
        ) => {
          try {
            const params: UserApi.UserListParams = {
              page: page.currentPage,
              page_size: page.pageSize,
              ...formValues,
            };

            const result = await getUserListApi(params);

            return {
              items: result.users || [],
              total: result.pagination?.total_items
                ? Number(result.pagination.total_items)
                : 0,
            };
          } catch (error: any) {
            console.error('Failed to fetch users:', error);
            message.error(
              `Failed to load users: ${error.message || 'Unknown error'}`,
            );
            return { items: [], total: 0 };
          }
        },
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

// 添加用户
function handleAdd() {
  userFormModalApi.setData({ mode: 'create' });
  userFormModalApi.open();
}

// 编辑用户
function handleEdit(row: UserApi.User) {
  userFormModalApi.setData({ mode: 'edit', record: row });
  userFormModalApi.open();
}

// 刷新列表
async function handleSuccess() {
  await gridApi.reload();
}

// 删除用户 - 使用 ant-design-vue 的 Modal.confirm
function handleDelete(row: UserApi.User) {
  AntModal.confirm({
    title: $t('common.deleteConfirm'),
    content: $t('ui.actionMessage.deleteConfirm', [row.username]),
    onOk: async () => {
      try {
        await deleteUserApi(row.user_id);
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
  <Page :auto-content-height="true">
    <Grid>
      <template #toolbar-tools>
        <UserFormModal @success="handleSuccess" />
        <Button type="primary" @click="handleAdd">
          <Plus class="mr-1 size-4" />
          {{ $t('common.add') }}
        </Button>
      </template>
      <template #action="{ row }">
        <Button type="link" @click="handleEdit(row)">
          {{ $t('common.edit') }}
        </Button>
        <Button danger type="link" @click="handleDelete(row)">
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
