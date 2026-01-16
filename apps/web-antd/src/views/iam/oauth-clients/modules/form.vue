<script lang="ts" setup>
import type { OAuthClientApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { createOAuthClientApi, updateOAuthClientApi } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const isEdit = ref(false);
const clientId = ref<string>();

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
      // 将文本框的多行内容转换为数组
      const redirectUris = values.redirect_uris_text
        ? values.redirect_uris_text
            .split('\n')
            .map((uri: string) => uri.trim())
            .filter((uri: string) => uri.length > 0)
        : [];

      const submitData: OAuthClientApi.CreateClientParams | OAuthClientApi.UpdateClientParams = {
        name: values.name,
        redirect_uris: redirectUris,
        grant_types: values.grant_types,
        scopes: values.scopes,
      };

      if (isEdit.value && clientId.value) {
        await updateOAuthClientApi(clientId.value, submitData);
      } else {
        await createOAuthClientApi({
          ...submitData,
          tenant_id: values.tenant_id || 'default',
        } as OAuthClientApi.CreateClientParams);
      }

      emits('success');
      await drawerApi.close();
    } catch (error) {
      console.error('Error saving OAuth client:', error);
    } finally {
      drawerApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<OAuthClientApi.Client>();
      isEdit.value = !!data?.client_id;
      clientId.value = data?.client_id;

      if (data) {
        // 将数组转换为多行文本
        const redirectUrisText = Array.isArray(data.redirect_uris)
          ? data.redirect_uris.join('\n')
          : '';

        formApi.setValues({
          ...data,
          redirect_uris_text: redirectUrisText,
        });
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
