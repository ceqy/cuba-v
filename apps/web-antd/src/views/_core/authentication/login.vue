<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

// 租户选项
const TENANT_OPTIONS: BasicOption[] = [
  {
    label: 'Default',
    value: 'default',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      defaultValue: 'admin',
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z
        .string()
        .min(3, { message: $t('authentication.usernameTip') })
        .max(20, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      defaultValue: 'testpassword',
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(6, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenSelect',
      componentProps: {
        options: TENANT_OPTIONS,
        placeholder: $t('authentication.tenantIdTip'),
      },
      defaultValue: 'default',
      fieldName: 'tenant_id',
      label: $t('authentication.tenantId'),
      rules: z.string().min(1, { message: $t('authentication.tenantIdTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authStore.authLogin"
  />
</template>
