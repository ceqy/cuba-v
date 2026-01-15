import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace UserApi {
  export interface User {
    user_id: string;
    username: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
    email_verified: boolean;
    is_active: boolean;
    roles: string[];
    created_at: string;
    phone?: string;
    tenant_id: string;
  }

  export interface UserListResult {
    users: User[];
    pagination?: {
      current_page: number;
      page_size: number;
      total_items: string;
      total_pages: number;
    };
  }

  export interface UserListParams {
    page?: number;
    page_size?: number;
    username?: string;
    email?: string;
    tenant_id?: string;
    phone?: string;
  }

  export interface UserEditParams {
    username?: string;
    email?: string;
    display_name?: string;
    avatar_url?: string;
    is_active?: boolean;
    role_ids?: string[];
    tenant_id?: string;
    password?: string;
  }
}

/**
 * 获取当前用户信息
 * GET /api/v1/auth/me
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const response = await requestClient.get<{
    roles: string[];
    user: UserApi.User;
  }>('/v1/auth/me');

  const { user, roles } = response;
  return {
    userId: user.user_id,
    username: user.username,
    realName: user.display_name || user.username,
    avatar: user.avatar_url || '',
    roles: roles || [],
    desc: '',
    homePath: '/analytics',
    token: '',
  };
}

/**
 * 获取用户列表
 * GET /api/v1/auth/users
 */
export async function getUserListApi(params?: UserApi.UserListParams) {
  // 转换参数格式以匹配后端 API
  const apiParams: Record<string, any> = {};

  if (params?.page) {
    apiParams['pagination.page'] = params.page;
  }
  if (params?.page_size) {
    apiParams['pagination.page_size'] = params.page_size;
  }
  if (params?.username) {
    apiParams.username = params.username;
  }
  if (params?.email) {
    apiParams.email = params.email;
  }

  return requestClient.get<UserApi.UserListResult>('/v1/auth/users', {
    params: apiParams,
  });
}

/**
 * 创建用户
 * POST /api/v1/auth/register
 */
export async function createUserApi(data: UserApi.UserEditParams) {
  return requestClient.post('/v1/auth/register', data);
}

/**
 * 更新用户
 * PATCH /api/v1/auth/users/:id
 */
export async function updateUserApi(
  userId: string,
  data: UserApi.UserEditParams,
) {
  return requestClient.patch(`/v1/auth/users/${userId}`, data);
}

/**
 * 删除用户
 * DELETE /api/v1/auth/users/:id
 */
export async function deleteUserApi(userId: string) {
  return requestClient.delete(`/v1/auth/users/${userId}`);
}

/**
 * 获取用户的角色列表
 * GET /api/v1/rbac/users/:userId/roles
 */
export async function getUserRolesApi(userId: string) {
  return requestClient.get<{ role_ids: string[] }>(
    `/v1/rbac/users/${userId}/roles`,
  );
}

/**
 * 给用户分配角色
 * POST /api/v1/rbac/users/:userId/roles/:roleId
 */
export async function assignUserRoleApi(userId: string, roleId: string) {
  return requestClient.post(`/v1/rbac/users/${userId}/roles/${roleId}`, {});
}

/**
 * 移除用户的角色
 * DELETE /api/v1/rbac/users/:userId/roles/:roleId
 */
export async function removeUserRoleApi(userId: string, roleId: string) {
  return requestClient.delete(`/v1/rbac/users/${userId}/roles/${roleId}`);
}
