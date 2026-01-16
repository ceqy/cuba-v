import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', title: '#', width: 60 },
    {
      field: 'document_reference.document_number',
      title: 'Invoice #',
      minWidth: 140,
    },
    {
      field: 'vendor_name', // Needs to be mapped from supplier API response
      title: 'Vendor',
      minWidth: 200,
    },
    {
      field: 'amount.value',
      title: 'Amount',
      width: 120,
      formatter: ({ cellValue }) =>
        cellValue ? Number(cellValue).toLocaleString() : '0.00',
    },
    {
      field: 'due_date',
      title: 'Due Date',
      width: 120,
      formatter: 'formatDate',
    },
    {
      field: 'status',
      title: 'Status',
      width: 100,
      slots: { default: 'status' },
    },
  ];
}

export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'company_code',
      label: 'Company Code',
      defaultValue: '1000',
    },
    {
      component: 'Input',
      fieldName: 'supplier_id',
      label: 'Vendor ID',
    },
  ];
}
