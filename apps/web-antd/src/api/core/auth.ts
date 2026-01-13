import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 注册接口参数 */
  export interface RegisterParams {
    username: string;
    email: string;
    password: string;
    tenant_id: string;
  }

  /** 注册接口返回值 */
  export interface RegisterResult {
    user_id: string;
  }

  /** 登录接口参数 */
  export interface LoginParams {
    username: string;
    password: string;
    tenant_id: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    session_id: string;
    mfa_required: boolean;
  }

  /** 刷新令牌参数 */
  export interface RefreshParams {
    refresh_token: string;
  }

  /** 刷新令牌返回值 (同 LoginResult) */
  export type RefreshResult = LoginResult;

  /** 注销参数 */
  export interface LogoutParams {
    session_id: string;
  }

  /** 注销返回值 */
  export interface LogoutResult {
    success: boolean;
  }
}

/**
 * 用户注册
 */
export async function registerApi(data: AuthApi.RegisterParams) {
  return requestClient.post<AuthApi.RegisterResult>('/v1/auth/register', data);
}

/**
 * 用户登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/v1/auth/login', data);
}

/**
 * 刷新 accessToken
 */
export async function refreshTokenApi(refreshToken: string) {
  return baseRequestClient.post<AuthApi.RefreshResult>('/v1/auth/refresh', {
    refresh_token: refreshToken,
  });
}

/**
 * 退出登录
 */
export async function logoutApi(sessionId: string, accessToken: string) {
  return baseRequestClient.post<AuthApi.LogoutResult>(
    '/v1/auth/logout',
    { session_id: sessionId },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

/**
 * 获取用户权限码
 * GET /api/v1/auth/codes
 */
export async function getAccessCodesApi(): Promise<string[]> {
  const response = await requestClient.get<{ codes: string[] }>('/v1/auth/codes');
  return response.codes || [];
}
