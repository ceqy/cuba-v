import { requestClient } from '#/api/request';

export namespace PermissionApi {
  export interface Permission {
    permission_id: string;
    code: string;
    resource: string;
    action: string;
    description?: string;
    created_at: string;
    effect?: string;
    parent_id?: string;
    children?: Permission[];
  }

  export interface PermissionListResult {
    permissions: Permission[];
    pagination: {
      page_size: number;
      page_token?: string;
      total_pages: number;
      total_size: number;
    };
  }

  export interface PermissionListParams {
    page_size?: number;
    page_token?: string;
    code?: string;
    resource?: string;
  }
}

export async function getPermissionsApi(
  params?: PermissionApi.PermissionListParams,
) {
  return requestClient.get<PermissionApi.PermissionListResult>(
    '/v1/rbac/permissions',
    { params },
  );
}
