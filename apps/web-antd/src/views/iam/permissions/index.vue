<script lang="ts" setup>
import type { PermissionApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPermissionsApi } from '#/api';
import { $t } from '#/locales';

import { useColumns, useSearchFormSchema } from './data';

// 存储所有权限数据（用于前端分页和搜索）
const allPermissions = ref<PermissionApi.Permission[]>([]);
const isLoaded = ref(false);

// 加载所有权限数据
async function loadAllPermissions() {
  try {
    const result = await getPermissionsApi({ page_size: 1000 });
    allPermissions.value = result.permissions || [];
  } catch (error: any) {
    console.error('Failed to fetch permissions:', error);
    message.error(`加载权限列表失败: ${error.message || '未知错误'}`);
    allPermissions.value = [];
  } finally {
    isLoaded.value = true;
  }
}

// 前端过滤和分页
function filterAndPaginate(
  page: { currentPage: number; pageSize: number },
  formValues: Record<string, any>,
) {
  let filtered = [...allPermissions.value];

  // 按 code 搜索
  if (formValues?.code) {
    const searchCode = formValues.code.toLowerCase();
    filtered = filtered.filter((perm) =>
      perm.code.toLowerCase().includes(searchCode),
    );
  }

  // 按 resource 搜索
  if (formValues?.resource) {
    const searchResource = formValues.resource.toLowerCase();
    filtered = filtered.filter((perm) =>
      perm.resource.toLowerCase().includes(searchResource),
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
    columns: useColumns(),
    keepSource: true,
    height: 'auto',
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
            await loadAllPermissions();
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
  loadAllPermissions();
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
