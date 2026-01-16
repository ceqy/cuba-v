import { requestClient } from '#/api/request';

export namespace OAuthClientApi {
  export interface Client {
    client_id: string;
    client_secret: string;
    name: string;
    redirect_uris: string[];
    grant_types: string[];
    scopes: string[];
    tenant_id?: string;
    created_at: string;
  }

  export interface ClientListResult {
    clients: Client[];
  }

  export interface CreateClientParams {
    name: string;
    redirect_uris: string[];
    grant_types: string[];
    scopes: string[];
    tenant_id?: string;
  }

  export interface UpdateClientParams {
    name?: string;
    redirect_uris?: string[];
    grant_types?: string[];
    scopes?: string[];
  }
}

/**
 * 获取 OAuth2 客户端列表
 */
export async function getOAuthClientsApi() {
  return requestClient.get<OAuthClientApi.ClientListResult>('/v1/oauth2/clients');
}

/**
 * 获取 OAuth2 客户端详情
 */
export async function getOAuthClientApi(clientId: string) {
  return requestClient.get<OAuthClientApi.Client>(`/v1/oauth2/clients/${clientId}`);
}

/**
 * 创建 OAuth2 客户端
 */
export async function createOAuthClientApi(data: OAuthClientApi.CreateClientParams) {
  return requestClient.post<OAuthClientApi.Client>('/v1/oauth2/clients', data);
}

/**
 * 更新 OAuth2 客户端
 */
export async function updateOAuthClientApi(clientId: string, data: OAuthClientApi.UpdateClientParams) {
  return requestClient.patch<OAuthClientApi.Client>(`/v1/oauth2/clients/${clientId}`, data);
}

/**
 * 删除 OAuth2 客户端
 */
export async function deleteOAuthClientApi(clientId: string) {
  return requestClient.delete(`/v1/oauth2/clients/${clientId}`);
}
