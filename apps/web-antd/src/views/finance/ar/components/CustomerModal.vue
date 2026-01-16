<script lang="ts" setup>
import type { Customer } from '#/api/finance';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message } from 'ant-design-vue';
import { createCustomer } from '#/api/finance';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  labelWidth: 100,
  schema: [
    {
      fieldName: 'customer_id',
      label: 'Customer ID',
      component: 'Input',
      componentProps: { placeholder: 'e.g. CUST1001' },
      rules: 'required',
    },
    {
      fieldName: 'name',
      label: 'Name',
      component: 'Input',
      rules: 'required',
    },
    {
      fieldName: 'company_code',
      label: 'Company Code',
      component: 'Input',
      defaultValue: '1000',
      rules: 'required',
    },
    {
      fieldName: 'account_group',
      label: 'Account Group',
      component: 'Select',
      defaultValue: 'KUNN',
      componentProps: {
        options: [
          { label: 'External Customer (KUNN)', value: 'KUNN' },
          { label: 'Related Party (REL)', value: 'REL' },
          { label: 'One-time Customer (ONE)', value: 'ONE' },
        ],
      },
      rules: 'required',
    },
    {
      fieldName: 'reconciliation_account',
      label: 'Recon. Account',
      component: 'Input',
      defaultValue: '112000',
      rules: 'required',
      helpMessage: 'GL Receivable Account',
    },
    {
      fieldName: 'payment_terms',
      label: 'Payment Terms',
      component: 'Input',
      defaultValue: 'NT30',
      componentProps: { placeholder: 'e.g. NT30' },
    },
    {
      fieldName: 'credit_limit',
      label: 'Credit Limit',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: 0 },
    },
  ],
  showActionButtonGroup: false,
});

const [Modal, modalApi] = useVbenModal({
  title: 'Create Customer',
  onConfirm: handleSubmit,
});

async function handleSubmit() {
  try {
    await formApi.validate();
    const values = await formApi.getValues();
    modalApi.setState({ confirmLoading: true });

    await createCustomer(values as Customer);

    message.success('Customer created successfully');
    modalApi.close();
    emit('success');
    formApi.resetValues();
  } catch (error: any) {
    console.error(error);
    message.error(`Failed to create customer: ${error.message}`);
  } finally {
    modalApi.setState({ confirmLoading: false });
  }
}
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
