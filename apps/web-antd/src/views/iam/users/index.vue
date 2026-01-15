<script lang="ts" setup>
import type { UserApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Modal as AntModal, Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUserApi, getUserListApi } from '#/api';
import { $t } from '#/locales';

import { useColumns, useSearchFormSchema } from './data';
import UserForm from './modules/form.vue';
import RolesDrawer from './modules/roles-drawer.vue';

// 使用 Modal 连接用户表单组件
const [UserFormModal, userFormModalApi] = useVbenModal({
  connectedComponent: UserForm,
});

// 使用 Drawer 连接角色分配组件
const [UserRolesDrawer, rolesDrawerApi] = useVbenDrawer({
  connectedComponent: RolesDrawer,
});

// 存储所有用户数据（用于前端分页和搜索）
const allUsers = ref<UserApi.User[]>([]);
const isLoaded = ref(false);

// 加载所有用户数据
async function loadAllUsers() {
  try {
    const result = await getUserListApi({ page_size: 1000 });
    allUsers.value = result.users || [];
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    message.error(`加载用户列表失败: ${error.message || '未知错误'}`);
    allUsers.value = [];
  } finally {
    isLoaded.value = true;
  }
}

// 前端过滤和分页
function filterAndPaginate(
  page: { currentPage: number; pageSize: number },
  formValues: Record<string, any>,
) {
  let filtered = [...allUsers.value];

  // 按用户名搜索
  if (formValues?.username) {
    const searchUsername = formValues.username.toLowerCase();
    filtered = filtered.filter((user) =>
      user.username.toLowerCase().includes(searchUsername),
    );
  }

  // 按邮箱搜索
  if (formValues?.email) {
    const searchEmail = formValues.email.toLowerCase();
    filtered = filtered.filter((user) =>
      user.email?.toLowerCase().includes(searchEmail),
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
            await loadAllUsers();
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
  loadAllUsers();
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

// 分配角色
function handleAssignRoles(row: UserApi.User) {
  rolesDrawerApi.setData(row);
  rolesDrawerApi.open();
}

// 刷新列表
async function handleSuccess() {
  // 重新加载所有数据并刷新表格
  isLoaded.value = false;
  await loadAllUsers();
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
        // 获取错误信息，可能在不同字段中
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data ||
          error.message ||
          String(error) ||
          '';
        const errorStr =
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);

        if (error?.response?.status === 403) {
          message.error($t('common.noPermission') || '没有权限执行此操作');
        } else if (
          errorStr.includes('foreign key constraint') ||
          errorStr.includes('user_sessions') ||
          errorStr.includes('user_sessions_user_id_fkey')
        ) {
          message.error(
            '该用户存在关联的会话数据，无法删除。请联系管理员清除会话后再试',
          );
        } else if (errorStr.includes('violates')) {
          message.error('该用户存在关联数据，无法直接删除');
        } else {
          message.error(
            typeof errorMsg === 'string' ? errorMsg : $t('common.error'),
          );
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
        <Button type="link" @click="handleAssignRoles(row)">角色</Button>
        <Button danger type="link" @click="handleDelete(row)">
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
    <UserRolesDrawer @success="handleSuccess" />
  </Page>
</template>
