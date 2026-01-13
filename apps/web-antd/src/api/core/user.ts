import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取当前用户信息
 * GET /api/v1/auth/me
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const response = await requestClient.get<{
    user: {
      avatar_url?: string;
      display_name?: string;
      email?: string;
      user_id: string;
      username: string;
    };
    roles: string[];
  }>('/v1/auth/me');

  // 转换后端响应格式为前端 UserInfo 格式
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
