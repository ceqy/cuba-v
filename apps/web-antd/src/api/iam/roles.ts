import { requestClient } from '#/api/request';

export namespace RoleApi {
  export interface Role {
    role_id: string;
    name: string;
    description?: string;
    parent_id?: string;
    tenant_id: string;
    is_immutable: boolean;
    created_at: string;
  }

  export interface RoleListResult {
    roles: Role[];
    pagination?: {
      current_page: number;
      page_size: number;
      total_items: string;
      total_pages: number;
    };
  }

  export interface RoleListParams {
    page?: number;
    page_size?: number;
    name?: string;
  }
}

export async function getRolesApi(params?: RoleApi.RoleListParams) {
  // 转换参数格式以匹配后端 API
  const apiParams: Record<string, any> = {};
  
  if (params?.page) {
    apiParams['pagination.page'] = params.page;
  }
  if (params?.page_size) {
    apiParams['pagination.page_size'] = params.page_size;
  }
  if (params?.name) {
    apiParams.name = params.name;
  }
  
  return requestClient.get<RoleApi.RoleListResult>('/v1/rbac/roles', {
    params: apiParams,
  });
}

export async function createRoleApi(data: any) {
  return requestClient.post('/v1/rbac/roles', data);
}

export async function updateRoleApi(id: string, data: any) {
  return requestClient.patch(`/v1/rbac/roles/${id}`, data);
}

export async function deleteRoleApi(id: string) {
  return requestClient.delete(`/v1/rbac/roles/${id}`);
}

/**
 * 获取角色已分配的权限
 */
export async function getRolePermissionsApi(roleId: string) {
  return requestClient.get<{ permission_ids: string[] }>(
    `/v1/rbac/roles/${roleId}/permissions`,
  );
}

/**
 * 给角色分配权限
 */
export async function assignRolePermissionsApi(
  roleId: string,
  permissionIds: string[],
) {
  return requestClient.post(`/v1/rbac/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
}
