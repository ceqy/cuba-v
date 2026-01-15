import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      field: 'user_id',
      title: 'ID',
      width: 100,
      visible: false, // Usually ID is hidden or optional
    },
    {
      field: 'username',
      title: $t('iam.user.username'),
      minWidth: 120,
    },
    {
      field: 'email',
      title: $t('iam.user.email'),
      minWidth: 180,
    },
    {
      field: 'roles',
      title: $t('iam.user.roles'),
      width: 180,
      formatter: ({ row }) => {
        return Array.isArray(row.roles) ? row.roles.join(', ') : row.roles;
      },
    },
    {
      field: 'email_verified',
      title: $t('iam.user.email_verified') || 'Email Verified',
      width: 120,
      formatter: ({ cellValue }) => {
        return cellValue ? 'Yes' : 'No';
      },
    },
    {
      field: 'created_at',
      title: $t('iam.user.created_at'),
      width: 180,
      formatter: ({ cellValue }) => {
        if (!cellValue) return '-';
        const date = new Date(cellValue);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      title: $t('common.action'),
      fixed: 'right',
      width: 180,
      slots: { default: 'action' },
    },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('iam.user.username'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('iam.user.email'),
    },
    // Add other search fields if needed
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
