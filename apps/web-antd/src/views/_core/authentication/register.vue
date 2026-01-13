<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, h } from 'vue';

import { AuthenticationRegister, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import type { AuthApi } from '#/api';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Register' });

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
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z
        .string()
        .min(3, { message: $t('authentication.usernameTip') })
        .max(20, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.emailTip'),
        type: 'email',
      },
      fieldName: 'email',
      label: $t('authentication.email'),
      rules: z.string().email({ message: $t('authentication.emailValidErrorTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      renderComponentContent() {
        return {
          strengthText: () => $t('authentication.passwordStrength'),
        };
      },
      rules: z.string().min(6, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.confirmPassword'),
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: $t('authentication.passwordTip') })
            .min(6, { message: $t('authentication.passwordTip') })
            .refine((value) => value === password, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('authentication.confirmPassword'),
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
      component: 'VbenCheckbox',
      fieldName: 'agreePolicy',
      renderComponentContent: () => ({
        default: () =>
          h('span', [
            $t('authentication.agree'),
            h(
              'a',
              {
                class: 'vben-link ml-1 ',
                href: '',
              },
              `${$t('authentication.privacyPolicy')} & ${$t('authentication.terms')}`,
            ),
          ]),
      }),
      rules: z.boolean().refine((value) => !!value, {
        message: $t('authentication.agreeTip'),
      }),
    },
  ];
});

async function handleSubmit(values: Record<string, any>) {
  const registerParams: AuthApi.RegisterParams = {
    email: values.email,
    password: values.password,
    tenant_id: values.tenant_id,
    username: values.username,
  };
  await authStore.authRegister(registerParams);
}
</script>

<template>
  <AuthenticationRegister
    :form-schema="formSchema"
    :loading="authStore.registerLoading"
    @submit="handleSubmit"
  />
</template>
