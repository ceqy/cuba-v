<script lang="ts" setup>
import type { UserApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUserApi, getUserListApi } from '#/api';
import { $t } from '#/locales';

import { useColumns, useSearchFormSchema } from './data';
import UserForm from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
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

function handleAdd() {
  formDrawerApi.setData({}).open();
}

function handleEdit(row: UserApi.User) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

function handleDelete(row: UserApi.User) {
  Modal.confirm({
    title: $t('common.deleteConfirm'),
    content: $t('ui.actionMessage.deleteConfirm', [row.username]),
    onOk: async () => {
      try {
        await deleteUserApi(row.user_id);
        message.success($t('common.deleteSuccess'));
        await gridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <Grid>
      <template #toolbar-tools>
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
    <FormDrawer @success="gridApi.query()" />
  </Page>
</template>
