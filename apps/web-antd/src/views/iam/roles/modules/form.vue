<script lang="ts" setup>
import type { RoleApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { createRoleApi, updateRoleApi } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const isEdit = ref(false);
const roleId = ref<string>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();

    try {
      (isEdit.value && roleId.value)
        ? await updateRoleApi(roleId.value, values)
        : await createRoleApi({
            ...values,
            tenant_id: 'default',
        });

      emits('success');
      await drawerApi.close();
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      drawerApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<RoleApi.Role>();
      isEdit.value = !!data?.role_id;
      roleId.value = data?.role_id;

      if (data) {
        formApi.setValues(data);
      } else {
        formApi.resetForm();
      }
    }
  },
});
</script>

<template>
  <Drawer :title="isEdit ? $t('common.edit') : $t('common.create')">
    <Form />
  </Drawer>
</template>
