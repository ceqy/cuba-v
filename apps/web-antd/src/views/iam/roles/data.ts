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
      field: 'role_id',
      title: 'ID',
      width: 100,
      visible: false,
    },
    {
      field: 'name',
      title: $t('iam.role.name'),
      minWidth: 100,
    },
    {
      field: 'parent_id',
      title: $t('iam.role.parent'),
      width: 100,
      formatter: ({ cellValue }) => {
        return cellValue || '-';
      },
    },
    {
      field: 'description',
      title: $t('iam.role.description'),
      minWidth: 200,
    },
    {
      field: 'is_immutable',
      title: $t('iam.role.type'),
      width: 100,
      formatter: ({ cellValue }) => {
        return cellValue ? '系统' : '自定义';
      },
    },
    {
      field: 'created_at',
      title: $t('iam.role.created_at'),
      width: 240,
      formatter: 'formatDateTime',
    },
    {
      title: $t('common.action'),
      fixed: 'right',
      width: 240, // Ensure wide enough for buttons
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
        placeholder: '请输入角色名称',
      },
      fieldName: 'name',
      label: $t('iam.role.name'),
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入角色名称',
      },
      fieldName: 'name',
      label: $t('iam.role.name'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入角色描述',
        rows: 3,
      },
      fieldName: 'description',
      label: $t('iam.role.description'),
    },
  ];
}
