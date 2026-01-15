import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import type { AuthApi } from '#/api';

import { getUserInfoApi, loginApi, logoutApi, registerApi } from '#/api';
import { $t } from '#/locales';

/**
 * 解析 JWT Token 获取 payload
 */
function parseJwt(token: string): Record<string, any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {};
    }
    const base64Url = parts[1];
    if (!base64Url) {
      return {};
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const registerLoading = ref(false);

  /**
   * 异步处理登录操作
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const loginResult = await loginApi(params as AuthApi.LoginParams);

      const {
        access_token,
        refresh_token,
        session_id,
        expires_in,
      } = loginResult;

      if (access_token) {
        // 存储 token 和会话信息
        accessStore.setAccessToken(access_token);
        accessStore.setRefreshToken(refresh_token);
        accessStore.setSessionId(session_id);
        accessStore.setExpiresAt(Date.now() + expires_in * 1000);

        // 从 JWT 解析用户信息
        const jwtPayload = parseJwt(access_token);
        userInfo = {
          userId: jwtPayload.sub || session_id,
          username: params.username || '',
          realName: params.username || '',
          roles: jwtPayload.roles || [],
          avatar: '',
          desc: '',
          homePath: preferences.app.defaultHomePath,
          token: access_token,
        };

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(jwtPayload.roles || []);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          const targetPath = userInfo.homePath || preferences.app.defaultHomePath;
          onSuccess ? await onSuccess?.() : await router.push(targetPath);
        }

        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo.realName}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return { userInfo };
  }

  /**
   * 异步处理注册操作
   */
  async function authRegister(params: AuthApi.RegisterParams) {
    try {
      registerLoading.value = true;
      const result = await registerApi(params);

      notification.success({
        description: $t('authentication.registerSuccessDesc'),
        duration: 3,
        message: $t('authentication.registerSuccess'),
      });

      await router.push(LOGIN_PATH);
      return result;
    } finally {
      registerLoading.value = false;
    }
  }

  async function logout(redirect: boolean = true) {
    try {
      const sessionId = accessStore.sessionId;
      const accessToken = accessStore.accessToken;
      if (sessionId && accessToken) {
        await logoutApi(sessionId, accessToken);
      }
    } catch {
      // 忽略注销 API 错误
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? { redirect: encodeURIComponent(router.currentRoute.value.fullPath) }
        : {},
    });
  }

  async function fetchUserInfo() {
    const token = accessStore.accessToken;
    if (!token) {
      return null;
    }
    
    // Instead of parsing JWT locally, use the API to get fresh full user info
    try {
        const userInfo = await getUserInfoApi();
        userStore.setUserInfo(userInfo);
        return userInfo;
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        return null; // Or handle error appropriately
    }
  }

  function $reset() {
    loginLoading.value = false;
    registerLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    authRegister,
    fetchUserInfo,
    loginLoading,
    logout,
    registerLoading,
  };
});
