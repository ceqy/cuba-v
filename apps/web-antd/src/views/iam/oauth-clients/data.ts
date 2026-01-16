import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'seq',
      title: '#',
      width: 60,
    },
    {
      field: 'name',
      title: $t('iam.oauth_client.name'),
      minWidth: 150,
    },
    {
      field: 'client_id',
      title: $t('iam.oauth_client.client_id'),
      minWidth: 280,
      showOverflow: 'tooltip',
    },
    {
      field: 'redirect_uris',
      title: $t('iam.oauth_client.redirect_uris'),
      minWidth: 250,
      formatter: ({ cellValue }) => {
        if (Array.isArray(cellValue)) {
          return cellValue.join(', ');
        }
        return cellValue || '-';
      },
    },
    {
      field: 'grant_types',
      title: $t('iam.oauth_client.grant_types'),
      width: 180,
      formatter: ({ cellValue }) => {
        if (Array.isArray(cellValue)) {
          return cellValue.join(', ');
        }
        return cellValue || '-';
      },
    },
    {
      field: 'scopes',
      title: $t('iam.oauth_client.scopes'),
      width: 180,
      formatter: ({ cellValue }) => {
        if (Array.isArray(cellValue)) {
          return cellValue.join(', ');
        }
        return cellValue || '-';
      },
    },
    {
      field: 'created_at',
      title: $t('iam.oauth_client.created_at'),
      width: 180,
      formatter: 'formatDateTime',
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
      componentProps: {
        allowClear: true,
        placeholder: '请输入客户端名称',
      },
      fieldName: 'name',
      label: $t('iam.oauth_client.name'),
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入客户端名称',
      },
      fieldName: 'name',
      label: $t('iam.oauth_client.name'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入回调地址，每行一个',
        rows: 3,
      },
      fieldName: 'redirect_uris_text',
      label: $t('iam.oauth_client.redirect_uris'),
      rules: 'required',
      help: '每行输入一个回调地址',
    },
    {
      component: 'CheckboxGroup',
      componentProps: {
        options: [
          { label: 'authorization_code', value: 'authorization_code' },
          { label: 'refresh_token', value: 'refresh_token' },
          { label: 'client_credentials', value: 'client_credentials' },
          { label: 'password', value: 'password' },
        ],
      },
      fieldName: 'grant_types',
      label: $t('iam.oauth_client.grant_types'),
      rules: 'required',
      defaultValue: ['authorization_code'],
    },
    {
      component: 'CheckboxGroup',
      componentProps: {
        options: [
          { label: 'openid', value: 'openid' },
          { label: 'profile', value: 'profile' },
          { label: 'email', value: 'email' },
          { label: 'offline_access', value: 'offline_access' },
        ],
      },
      fieldName: 'scopes',
      label: $t('iam.oauth_client.scopes'),
      rules: 'required',
      defaultValue: ['openid'],
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入租户ID',
      },
      fieldName: 'tenant_id',
      label: $t('iam.oauth_client.tenant_id'),
      defaultValue: 'default',
    },
  ];
}
