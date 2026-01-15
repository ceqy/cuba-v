import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'permission_id',
      title: 'ID',
      width: 150,
      visible: false,
    },
    {
      field: 'code',
      title: $t('iam.permission.code'),
      minWidth: 150,
    },
    {
      field: 'name',
      title: $t('iam.permission.name'),
      minWidth: 150,
      visible: false, // API doesn't list 'name' in Permission interface, using 'code' usually. Or maybe description?
    },
    {
      field: 'resource',
      title: $t('iam.permission.resource'),
      minWidth: 120,
    },
    {
      field: 'action',
      title: $t('iam.permission.action'),
      width: 100,
      formatter: ({ cellValue }) => {
        return cellValue.toUpperCase();
      },
    },
    {
      field: 'effect',
      title: 'Effect', // i18n key might be missing
      width: 80,
      slots: { default: 'effect' }, // Custom slot for badge
    },
    {
      field: 'description',
      title: $t('iam.permission.description'),
      minWidth: 200,
    },
    {
      field: 'created_at',
      title: $t('iam.permission.created_at'),
      width: 180,
      formatter: 'formatDateTime',
    },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入权限编码',
      },
      fieldName: 'code',
      label: $t('iam.permission.code'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入资源',
      },
      fieldName: 'resource',
      label: $t('iam.permission.resource'),
    },
  ];
}
