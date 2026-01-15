import { requestClient } from '#/api/request';

export namespace RoleApi {
  export interface Role {
    role_id: string;
    name: string;
    code: string;
    description?: string;
    status: string;
    is_active: boolean;
    permissions?: string[];
    created_at: string;
  }

  export interface RoleListResult {
    roles: Role[];
    pagination: {
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
    code?: string;
  }
}

export async function getRolesApi(params?: RoleApi.RoleListParams) {
  return requestClient.get<RoleApi.RoleListResult>('/v1/auth/roles', {
    params,
  });
}

export async function createRoleApi(data: any) {
  return requestClient.post('/v1/auth/roles', data);
}

export async function updateRoleApi(id: string, data: any) {
  return requestClient.patch(`/v1/auth/roles/${id}`, data);
}

export async function deleteRoleApi(id: string) {
  return requestClient.delete(`/v1/auth/roles/${id}`);
}
