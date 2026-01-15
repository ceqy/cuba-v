<script lang="ts" setup>
import type { PermissionApi } from '#/api';

import { Page } from '@vben/common-ui';

import { message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPermissionsApi } from '#/api';
import { $t } from '#/locales';

import { useColumns, useSearchFormSchema } from './data';

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
            const params: PermissionApi.PermissionListParams = {
              page_size: page.pageSize,
              ...formValues,
            };
            if (page.currentPage > 1) {
              params.page_token = (page.currentPage - 1).toString(); // Using simplistic token pagination assumption 
              // Real token pagination logic might be different (fetching next token from prev response)
              // But for restoration, this suffices to start.
            }

            const result = await getPermissionsApi(params);

            return {
              items: result.permissions || [],
              total: result.pagination?.total_size || 0,
            };
          } catch (error: any) {
            console.error('Failed to fetch permissions:', error);
            message.error(
              `Failed to load permissions: ${error.message || 'Unknown error'}`,
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
</script>

<template>
  <Page :auto-content-height="true">
    <Grid>
      <template #effect="{ row }">
        <Tag v-if="row.effect === 'ALLOW'" color="green">ALLOW</Tag>
        <Tag v-else-if="row.effect === 'DENY'" color="red">DENY</Tag>
        <span v-else>{{ row.effect }}</span>
      </template>
    </Grid>
  </Page>
</template>
