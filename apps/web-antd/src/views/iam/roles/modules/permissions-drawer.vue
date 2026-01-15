<script lang="ts" setup>
import type { PermissionApi, RoleApi } from '#/api';

import { ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Checkbox, message, Spin } from 'ant-design-vue';

import {
  assignRolePermissionsApi,
  getPermissionsApi,
  getRolePermissionsApi,
} from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const loading = ref(false);
const allPermissions = ref<PermissionApi.Permission[]>([]);
const selectedPermissionIds = ref<string[]>([]);
const currentRole = ref<RoleApi.Role | null>(null);

// 按资源分组权限
const groupedPermissions = ref<
  Record<string, PermissionApi.Permission[]>
>({});

// 加载所有权限
async function loadPermissions() {
  try {
    const result = await getPermissionsApi({ page_size: 1000 });
    allPermissions.value = result.permissions || [];

    // 按资源分组
    const grouped: Record<string, PermissionApi.Permission[]> = {};
    for (const perm of allPermissions.value) {
      const resource = perm.resource || 'other';
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(perm);
    }
    groupedPermissions.value = grouped;
  } catch (error: any) {
    console.error('Failed to load permissions:', error);
    message.error('加载权限列表失败');
  }
}

// 加载角色已有权限
async function loadRolePermissions(roleId: string) {
  try {
    const result = await getRolePermissionsApi(roleId);
    selectedPermissionIds.value = result.permission_ids || [];
  } catch (error: any) {
    console.error('Failed to load role permissions:', error);
    // 如果获取失败，可能是角色还没有分配权限，设置为空数组
    selectedPermissionIds.value = [];
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!currentRole.value) return;

    drawerApi.lock();
    try {
      await assignRolePermissionsApi(
        currentRole.value.role_id,
        selectedPermissionIds.value,
      );
      message.success('权限分配成功');
      emits('success');
      await drawerApi.close();
    } catch (error: any) {
      console.error('Failed to assign permissions:', error);
      message.error(error.message || '权限分配失败');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      loading.value = true;
      const data = drawerApi.getData<RoleApi.Role>();
      currentRole.value = data || null;

      // 加载权限列表
      if (allPermissions.value.length === 0) {
        await loadPermissions();
      }

      // 加载角色已有权限
      if (currentRole.value?.role_id) {
        await loadRolePermissions(currentRole.value.role_id);
      } else {
        selectedPermissionIds.value = [];
      }
      loading.value = false;
    }
  },
});

// 处理权限选择变化
function handlePermissionChange(permissionId: string, checked: boolean) {
  if (checked) {
    if (!selectedPermissionIds.value.includes(permissionId)) {
      selectedPermissionIds.value.push(permissionId);
    }
  } else {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(
      (id) => id !== permissionId,
    );
  }
}

// 全选/取消全选某个资源下的权限
function handleGroupSelectAll(resource: string, checked: boolean) {
  const permissions = groupedPermissions.value[resource] || [];
  const permissionIds = permissions.map((p) => p.permission_id);

  if (checked) {
    // 添加所有未选中的
    for (const id of permissionIds) {
      if (!selectedPermissionIds.value.includes(id)) {
        selectedPermissionIds.value.push(id);
      }
    }
  } else {
    // 移除所有
    selectedPermissionIds.value = selectedPermissionIds.value.filter(
      (id) => !permissionIds.includes(id),
    );
  }
}

// 检查某个资源下是否全选
function isGroupAllSelected(resource: string): boolean {
  const permissions = groupedPermissions.value[resource] || [];
  if (permissions.length === 0) return false;
  return permissions.every((p) =>
    selectedPermissionIds.value.includes(p.permission_id),
  );
}

// 检查某个资源下是否部分选中
function isGroupIndeterminate(resource: string): boolean {
  const permissions = groupedPermissions.value[resource] || [];
  if (permissions.length === 0) return false;
  const selectedCount = permissions.filter((p) =>
    selectedPermissionIds.value.includes(p.permission_id),
  ).length;
  return selectedCount > 0 && selectedCount < permissions.length;
}
</script>

<template>
  <Drawer
    :title="`分配权限 - ${currentRole?.name || ''}`"
    class="w-[600px]"
  >
    <Spin :spinning="loading">
      <div class="space-y-4">
        <div
          v-for="(permissions, resource) in groupedPermissions"
          :key="resource"
          class="rounded-lg border p-4"
        >
          <!-- 资源标题 -->
          <div class="mb-3 flex items-center border-b pb-2">
            <Checkbox
              :checked="isGroupAllSelected(resource)"
              :indeterminate="isGroupIndeterminate(resource)"
              @change="(e: any) => handleGroupSelectAll(resource, e.target.checked)"
            >
              <span class="font-medium text-base">{{ resource }}</span>
            </Checkbox>
          </div>

          <!-- 权限列表 -->
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="perm in permissions"
              :key="perm.permission_id"
              class="flex items-center"
            >
              <Checkbox
                :checked="selectedPermissionIds.includes(perm.permission_id)"
                @change="(e: any) => handlePermissionChange(perm.permission_id, e.target.checked)"
              >
                <span class="text-sm">{{ perm.description || perm.code }}</span>
                <span class="ml-1 text-xs text-gray-400">({{ perm.action }})</span>
              </Checkbox>
            </div>
          </div>
        </div>

        <div
          v-if="Object.keys(groupedPermissions).length === 0 && !loading"
          class="py-8 text-center text-gray-500"
        >
          暂无可用权限
        </div>
      </div>
    </Spin>
  </Drawer>
</template>
