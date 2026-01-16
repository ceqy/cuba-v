import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'expand', width: 60, slots: { content: 'expand_content' } },
    { type: 'seq', title: '#', width: 60 },
    {
      field: 'document_reference.document_number',
      title: $t('finance.gl.entry_number'),
      minWidth: 140,
    },
    {
      field: 'document_reference.fiscal_year',
      title: 'FY',
      width: 80,
    },
    {
      field: 'posting_date',
      title: 'Posting Date',
      width: 120,
      formatter: 'formatDate',
    },
    {
      field: 'header_text',
      title: 'Description',
      minWidth: 200,
    },
    {
      field: 'status',
      title: 'Status',
      width: 120,
      slots: { default: 'status' },
    },
    {
      title: 'Action',
      width: 180,
      fixed: 'right',
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
        placeholder: 'Company Code',
      },
      fieldName: 'company_code',
      label: 'Company',
      defaultValue: '1000',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: 'Fiscal Year',
      },
      fieldName: 'fiscal_year',
      label: 'Fiscal Year',
      defaultValue: 2024,
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'company_code',
      label: 'Company Code',
      rules: 'required',
      defaultValue: '1000',
    },
    {
      component: 'Input',
      fieldName: 'document_type',
      label: 'Document Type',
      rules: 'required',
      defaultValue: 'SA',
    },
    {
      component: 'DatePicker',
      fieldName: 'document_date',
      label: 'Document Date',
      defaultValue: new Date(),
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'posting_date',
      label: 'Posting Date',
      defaultValue: new Date(),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'fiscal_year',
      label: 'Fiscal Year',
      defaultValue: 2024,
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'fiscal_period',
      label: 'Fiscal Period',
      defaultValue: 1,
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'currency',
      label: 'Currency',
      defaultValue: 'CNY',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'header_text',
      label: 'Header Text',
      rules: 'required',
    },
  ];
}
