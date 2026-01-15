<script lang="ts" setup>
import type { RoleApi, UserApi } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { createUserApi, getRolesApi, updateUserApi } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const roleOptions = ref<{ label: string; value: string }[]>([]);
const isEditMode = ref(false);
const editingUser = ref<null | UserApi.User>(null);

// Load roles on mount
onMounted(async () => {
  try {
    const res = await getRolesApi({ page_size: 100 });
    roleOptions.value = (res.roles || []).map((r: RoleApi.Role) => ({
      label: r.name,
      value: r.role_id,
    }));
    // Update form schema with loaded options
    formApi.updateSchema([
      {
        fieldName: 'role_ids',
        componentProps: { options: roleOptions.value },
      },
    ]);
  } catch (error) {
    console.error('Failed to load roles', error);
  }
});

// 动态生成 schema，根据是否编辑模式决定密码是否必填
function getFormSchema() {
  const schema: any[] = [
    // ===== 基本信息 Fields =====
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.inputPlaceholder') || '请输入用户名',
        class: 'h-10',
        disabled: isEditMode.value, // 编辑模式下禁止修改用户名
      },
      fieldName: 'username',
      label: $t('iam.user.username'),
      rules: z.string().min(3, $t('ui.formRules.minLength', { length: 3 })),
      formItemClass: 'col-span-2',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.inputPlaceholder') || '请输入邮箱',
        class: 'h-10',
      },
      fieldName: 'email',
      label: $t('iam.user.email'),
      rules: z.string().email($t('ui.formRules.email')),
      formItemClass: 'col-span-2',
    },
    // ===== 账户设置 Fields =====
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: isEditMode.value
          ? $t('iam.user.passwordHelp') || '留空保持不变'
          : $t('common.inputPlaceholder') || '请输入密码',
        class: 'h-10',
        autocomplete: 'new-password', // 防止浏览器自动填充
      },
      fieldName: 'password',
      label: $t('iam.user.password') || '密码',
      rules: isEditMode.value
        ? z.string().optional()
        : z.string().min(6, $t('ui.formRules.minLength', { length: 6 })),
      formItemClass: 'col-span-2',
      help: isEditMode.value
        ? $t('iam.user.passwordHelp') || '留空保持当前密码'
        : undefined,
    },
  ];

  // 仅在编辑模式下添加角色和状态字段
  if (isEditMode.value) {
    schema.push(
      {
        component: 'Select',
        componentProps: {
          mode: 'multiple',
          placeholder: $t('common.selectPlaceholder') || '请选择角色',
          options: roleOptions.value,
          class: 'min-h-10',
          optionFilterProp: 'label',
        },
        fieldName: 'role_ids',
        label: $t('iam.user.roles'),
        defaultValue: [],
        rules: z.array(z.string()).min(1, $t('ui.formRules.required')),
        formItemClass: 'col-span-2',
      },
      {
        component: 'Switch',
        componentProps: {
          checkedChildren: $t('common.active') || '启用',
          unCheckedChildren: $t('common.inactive') || '禁用',
        },
        fieldName: 'is_active',
        label: $t('iam.user.status'),
        defaultValue: true,
        formItemClass: 'col-span-2',
      },
    );
  }

  return schema;
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  layout: 'vertical',
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-2',
  schema: getFormSchema(),
  showDefaultActions: false,
});

// 计算 Modal 标题
const modalTitle = computed(() =>
  isEditMode.value
    ? $t('iam.user.editTitle') || '编辑用户'
    : $t('iam.user.createTitle') || '创建用户',
);

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<{ mode: string; record?: UserApi.User }>();
      isEditMode.value = data?.mode === 'edit';
      editingUser.value = data?.record || null;

      // 重置表单并更新 schema
      formApi.resetForm();
      formApi.updateSchema(getFormSchema());

      // 如果是编辑模式，填充表单数据
      if (isEditMode.value && editingUser.value) {
        // 尝试映射角色 Name 到 ID
        let mappedRoleIds: string[] = [];
        if (Array.isArray(editingUser.value.roles)) {
          mappedRoleIds = editingUser.value.roles
            .map((roleNameOrId) => {
              // 检查是否是 ID
              const isId = roleOptions.value.some((opt) => opt.value === roleNameOrId);
              if (isId) return roleNameOrId;
              
              // 尝试按 Name 查找 ID
              const found = roleOptions.value.find((opt) => opt.label === roleNameOrId);
              return found ? found.value : roleNameOrId;
            })
            .filter(Boolean);
        }

        formApi.setValues({
          username: editingUser.value.username,
          email: editingUser.value.email,
          role_ids: mappedRoleIds,
          is_active: editingUser.value.is_active,
          password: '', // 编辑时密码留空
        });
      }
    }
  },
  title: modalTitle,
});

// 监听 modalTitle 变化，更新 Modal 标题
watch(modalTitle, (newTitle) => {
  modalApi.setState({ title: newTitle });
});

async function onSubmit(values: Record<string, any>) {
  message.loading({
    content: $t('common.submitting') || '正在提交...',
    duration: 0,
    key: 'user-form-submitting',
  });
  modalApi.lock();

  try {
    if (isEditMode.value && editingUser.value) {
      // 编辑模式：调用更新 API
      const payload: any = {
        // username: values.username, // 移除 username，后端通常不支持修改用户名或无需再次发送
        email: values.email,
        role_ids: values.role_ids,
        is_active: values.is_active,
        // tenant_id: editingUser.value.tenant_id || 'default', // 移除 tenant_id，避免错误覆盖
      };

      // 只有填写了密码才提交
      if (values.password) {
        payload.password = values.password;
      }

      await updateUserApi(editingUser.value.user_id, payload);

      message.success({
        content: $t('common.updateSuccess') || '更新成功',
        duration: 2,
        key: 'user-form-submitting',
      });
    } else {
      // 创建模式：调用创建 API
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        // 创建时默认启用，角色留空或设为默认角色
        is_active: true,
        tenant_id: 'default',
        role_ids: [], // 或者根据需求设为默认角色
      };

      await createUserApi(payload);

      message.success({
        content: $t('common.createSuccess') || '创建成功',
        duration: 2,
        key: 'user-form-submitting',
      });
    }

    await modalApi.close();
    emits('success');
  } catch (error: any) {
    console.error('Failed to save user:', error);
    let errorMsg =
      error?.response?.data?.message || error?.message || $t('common.error');
    
    if (error?.response?.status === 403) {
      errorMsg = $t('common.noPermission') || '没有权限执行此操作';
    }

    message.error({
      content: errorMsg,
      duration: 3,
      key: 'user-form-submitting',
    });
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal class="user-form-modal">
    <div class="form-container">
      <Form />
    </div>
  </Modal>
</template>
