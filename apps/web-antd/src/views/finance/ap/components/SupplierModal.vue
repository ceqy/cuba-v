<script lang="ts" setup>
import type { Supplier } from '#/api/finance';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message } from 'ant-design-vue';
import { createSupplier } from '#/api/finance';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  labelWidth: 100,
  schema: [
    {
      fieldName: 'supplier_id',
      label: 'Vendor ID',
      component: 'Input',
      componentProps: { placeholder: 'e.g. VEND1001' },
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
      defaultValue: 'KRED',
      componentProps: {
        options: [
          { label: 'External Vendor (KRED)', value: 'KRED' },
          { label: 'Related Party (REL)', value: 'REL' },
          { label: 'One-time Vendor (ONE)', value: 'ONE' },
        ],
      },
      rules: 'required',
    },
    {
      fieldName: 'reconciliation_account',
      label: 'Recon. Account',
      component: 'Input',
      defaultValue: '211000',
      rules: 'required',
      helpMessage: 'GL Liability Account',
    },
    {
      fieldName: 'payment_terms',
      label: 'Payment Terms',
      component: 'Input',
      defaultValue: 'NT30',
      componentProps: { placeholder: 'e.g. NT30' },
    },
    {
      fieldName: 'telephone',
      label: 'Phone',
      component: 'Input',
    },
    {
      fieldName: 'email',
      label: 'Email',
      component: 'Input',
    },
  ],
  showActionButtonGroup: false,
});

const [Modal, modalApi] = useVbenModal({
  title: 'Create Supplier',
  onConfirm: handleSubmit,
});

async function handleSubmit() {
  try {
    await formApi.validate();
    const values = await formApi.getValues();
    modalApi.setState({ confirmLoading: true });

    await createSupplier(values as Supplier);

    message.success('Supplier created successfully');
    modalApi.close();
    emit('success');
    formApi.resetValues();
  } catch (error: any) {
    console.error(error);
    message.error(`Failed to create supplier: ${error.message}`);
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
