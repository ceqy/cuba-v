import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      field: 'role_id',
      title: 'ID',
      width: 100,
      visible: false,
    },
    {
      field: 'name',
      title: $t('iam.role.name'),
      minWidth: 150,
    },
    {
      field: 'code',
      title: $t('iam.role.code'),
      minWidth: 150,
    },
    {
      field: 'description',
      title: $t('iam.role.description'),
      minWidth: 200,
    },
    {
      field: 'is_immutable',
      title: $t('iam.role.is_immutable'),
      width: 120,
      formatter: ({ cellValue }) => {
        return cellValue ? 'System' : 'Custom';
      },
    },
    {
      field: 'created_at',
      title: $t('iam.role.created_at'),
      width: 180,
    },
    {
      title: $t('common.action'),
      fixed: 'right',
      width: 120,
      slots: { default: 'action' },
    },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('iam.role.name'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('iam.role.code'),
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('iam.role.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('iam.role.code'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('iam.role.description'),
    },
  ];
}
