<script lang="ts" setup>
import type { RoleApi, UserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { createUserApi, getRolesApi, updateUserApi } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const isEdit = ref(false);
const userId = ref<string>();

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
      // 注册接口只接受特定参数，过滤掉不支持的字段
      const payload = isEdit.value && userId.value 
        ? values 
        : {
            username: values.username,
            email: values.email,
            password: values.password,
            tenant_id: 'default',
          };

      await (isEdit.value && userId.value
        ? updateUserApi(userId.value, values)
        : createUserApi(payload));

      emits('success');
      await drawerApi.close();
    } catch (error: any) {
      console.error('Error saving user:', error);
      // 显示更详细的错误信息
      const errorMsg = error?.response?.data?.message || error?.message || $t('common.error');
      message.error(errorMsg);
    } finally {
      drawerApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<UserApi.User>();
      isEdit.value = !!data?.user_id; 
      userId.value = data?.user_id;

      // Load roles
      loadRoles();

      // Configure password validation: required for create, optional for edit
      formApi.updateSchema([
        {
          fieldName: 'password',
          rules: isEdit.value
            ? z.string().optional()
            : z.string().min(1, $t('ui.formRules.required')),
        },
      ]);

      if (isEdit.value && data) {
        formApi.setValues({
          username: data.username,
          email: data.email,
          display_name: data.display_name,
          // avatar_url: data.avatar_url,
          is_active: data.is_active,
          role_ids: data.roles || [],
        });
      } else {
        formApi.resetForm();
      }
    }
  },
});

async function loadRoles() {
  try {
    const res = await getRolesApi({ page_size: 100 });
    const options = (res.roles || []).map((r: RoleApi.Role) => ({
      label: r.name,
      value: r.role_id,
    }));

    formApi.updateSchema([
      {
        fieldName: 'role_ids',
        componentProps: { options },
      },
    ]);
  } catch (error) {
    console.error('Failed to load roles', error);
  }
}
</script>

<template>
  <Drawer :title="isEdit ? $t('common.edit') : $t('common.create')">
    <Form />
  </Drawer>
</template>
