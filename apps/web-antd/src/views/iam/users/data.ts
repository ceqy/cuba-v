import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'user_id',
      title: 'ID',
      width: 80,
      visible: false, // Usually ID is hidden or optional
    },
    {
      field: 'username',
      title: $t('iam.user.username'),
      minWidth: 100,
    },
    {
      field: 'email',
      title: $t('iam.user.email'),
      minWidth: 100,
    },
    {
      field: 'roles',
      title: $t('iam.user.roles'),
      width: 100,
      formatter: ({ row }) => {
        return Array.isArray(row.roles) ? row.roles.join(', ') : row.roles;
      },
    },
    {
      field: 'email_verified',
      title: $t('iam.user.email_verified') || 'Email Verified',
      width: 100,
      formatter: ({ cellValue }) => {
        return cellValue ? 'Yes' : 'No';
      },
    },
    {
      field: 'created_at',
      title: $t('iam.user.created_at'),
      width: 240,
      formatter: 'formatDateTime',
    },
    {
      title: $t('common.action'),
      fixed: 'right',
      width: 240,
      slots: { default: 'action' },
    },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入用户名',
      },
      fieldName: 'username',
      label: $t('iam.user.username'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入邮箱',
      },
      fieldName: 'email',
      label: $t('iam.user.email'),
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('iam.user.username'),
      rules: z.string().min(1, $t('ui.formRules.required')),
    },
    {
      component: 'Input',
      fieldName: 'display_name',
      label: $t('iam.user.display_name'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('iam.user.email'),
      rules: z.string().email($t('ui.formRules.email')),
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('ui.login.password') || 'Password',
      help: $t('iam.user.passwordHelp') || 'Leave empty to keep current',
    },
    {
      component: 'Select',
      fieldName: 'role_ids',
      label: $t('iam.user.roles'),
      defaultValue: [],
      componentProps: {
        mode: 'multiple',
        options: [], // Populated dynamically
      },
    },
    {
      component: 'Switch',
      fieldName: 'is_active',
      label: $t('iam.user.status'),
      defaultValue: true,
    },
  ];
}
