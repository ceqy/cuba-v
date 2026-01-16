import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', title: '#', width: 60 },
    {
      field: 'document_reference.document_number',
      title: 'Invoice #',
      minWidth: 140,
    },
    {
      field: 'customer_name', 
      title: 'Customer',
      minWidth: 200,
    },
    {
      field: 'amount.value',
      title: 'Amount',
      width: 120,
      formatter: ({ cellValue }) => cellValue ? Number(cellValue).toLocaleString() : '0.00',
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
     slots: { default: 'status' }
    },
  ];
}
