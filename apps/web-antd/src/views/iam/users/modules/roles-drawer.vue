<script lang="ts" setup>
import type { RoleApi, UserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Checkbox, message, Spin, Tag } from 'ant-design-vue';

import {
  assignUserRoleApi,
  getRolesApi,
  getUserRolesApi,
  removeUserRoleApi,
} from '#/api';

const emits = defineEmits(['success']);

const loading = ref(false);
const saving = ref(false);
const allRoles = ref<RoleApi.Role[]>([]);
const selectedRoleIds = ref<string[]>([]);
const originalRoleIds = ref<string[]>([]);
const currentUser = ref<UserApi.User | null>(null);

// 加载所有角色
async function loadRoles() {
  try {
    const result = await getRolesApi({ page_size: 1000 });
    allRoles.value = result.roles || [];
  } catch (error: any) {
    console.error('Failed to load roles:', error);
    message.error('加载角色列表失败');
  }
}

// 加载用户已有角色
async function loadUserRoles(userId: string) {
  try {
    const result = await getUserRolesApi(userId);
    selectedRoleIds.value = result.role_ids || [];
    originalRoleIds.value = [...selectedRoleIds.value];
  } catch (error: any) {
    console.error('Failed to load user roles:', error);
    // 如果获取失败，可能是用户还没有分配角色
    selectedRoleIds.value = [];
    originalRoleIds.value = [];
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!currentUser.value) return;

    drawerApi.lock();
    saving.value = true;

    try {
      const userId = currentUser.value.user_id;

      // 计算需要添加和移除的角色
      const toAdd = selectedRoleIds.value.filter(
        (id) => !originalRoleIds.value.includes(id),
      );
      const toRemove = originalRoleIds.value.filter(
        (id) => !selectedRoleIds.value.includes(id),
      );

      // 执行添加操作
      for (const roleId of toAdd) {
        await assignUserRoleApi(userId, roleId);
      }

      // 执行移除操作
      for (const roleId of toRemove) {
        await removeUserRoleApi(userId, roleId);
      }

      message.success('角色分配成功');
      emits('success');
      await drawerApi.close();
    } catch (error: any) {
      console.error('Failed to assign roles:', error);
      message.error(error.message || '角色分配失败');
    } finally {
      drawerApi.unlock();
      saving.value = false;
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      loading.value = true;
      const data = drawerApi.getData<UserApi.User>();
      currentUser.value = data || null;

      // 加载角色列表
      if (allRoles.value.length === 0) {
        await loadRoles();
      }

      // 加载用户已有角色
      if (currentUser.value?.user_id) {
        await loadUserRoles(currentUser.value.user_id);
      } else {
        selectedRoleIds.value = [];
        originalRoleIds.value = [];
      }
      loading.value = false;
    }
  },
});

// 处理角色选择变化
function handleRoleChange(roleId: string, checked: boolean) {
  if (checked) {
    if (!selectedRoleIds.value.includes(roleId)) {
      selectedRoleIds.value.push(roleId);
    }
  } else {
    selectedRoleIds.value = selectedRoleIds.value.filter((id) => id !== roleId);
  }
}

// 获取角色名称
function getRoleName(roleId: string): string {
  const role = allRoles.value.find((r) => r.role_id === roleId);
  return role?.name || roleId;
}
</script>

<template>
  <Drawer
    :title="`分配角色 - ${currentUser?.username || ''}`"
    class="w-[500px]"
  >
    <Spin :spinning="loading || saving">
      <div class="space-y-4">
        <!-- 当前已分配的角色 -->
        <div v-if="selectedRoleIds.length > 0" class="mb-4">
          <div class="mb-2 text-sm text-gray-500">已选择的角色：</div>
          <div class="flex flex-wrap gap-2">
            <Tag
              v-for="roleId in selectedRoleIds"
              :key="roleId"
              color="blue"
              closable
              @close="handleRoleChange(roleId, false)"
            >
              {{ getRoleName(roleId) }}
            </Tag>
          </div>
        </div>

        <!-- 角色列表 -->
        <div class="rounded-lg border p-4">
          <div class="mb-3 border-b pb-2 font-medium">可用角色</div>
          <div class="space-y-2">
            <div
              v-for="role in allRoles"
              :key="role.role_id"
              class="flex items-center justify-between rounded p-2 hover:bg-gray-50"
            >
              <Checkbox
                :checked="selectedRoleIds.includes(role.role_id)"
                @change="(e: any) => handleRoleChange(role.role_id, e.target.checked)"
              >
                <span class="font-medium">{{ role.name }}</span>
                <Tag v-if="role.is_immutable" class="ml-2" color="orange">
                  系统
                </Tag>
              </Checkbox>
              <span class="text-xs text-gray-400">
                {{ role.description || '-' }}
              </span>
            </div>
          </div>

          <div
            v-if="allRoles.length === 0 && !loading"
            class="py-4 text-center text-gray-500"
          >
            暂无可用角色
          </div>
        </div>
      </div>
    </Spin>
  </Drawer>
</template>
