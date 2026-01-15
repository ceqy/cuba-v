<script lang="ts" setup>
import type { RoleApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRoleApi, getRolesApi } from '#/api';
import { $t } from '#/locales';

import { useColumns, useSearchFormSchema } from './data';
import RoleForm from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: RoleForm,
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
            const params: RoleApi.RoleListParams = {
              page: page.currentPage,
              page_size: page.pageSize,
              ...formValues,
            };

            const result = await getRolesApi(params);

            return {
              items: result.roles || [],
              total: result.pagination?.total_items
                ? Number(result.pagination.total_items)
                : 0,
            };
          } catch (error: any) {
            console.error('Failed to fetch roles:', error);
            message.error(
              `Failed to load roles: ${error.message || 'Unknown error'}`,
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
  formDrawerApi.setData({});
  formDrawerApi.open();
}

function handleEdit(row: RoleApi.Role) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

function handleDelete(row: RoleApi.Role) {
  Modal.confirm({
    title: $t('common.deleteConfirm'),
    content: $t('ui.actionMessage.deleteConfirm', [row.name]),
    onOk: async () => {
      try {
        await deleteRoleApi(row.role_id);
        message.success($t('common.deleteSuccess'));
        gridApi.query();
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
        <Button type="link" @click="handleEdit(row)">{{ $t('common.edit') }}</Button>
        <Button danger type="link" @click="handleDelete(row)">{{ $t('common.delete') }}</Button>
      </template>
    </Grid>
    <FormDrawer @success="gridApi.query()" />
  </Page>
</template>
