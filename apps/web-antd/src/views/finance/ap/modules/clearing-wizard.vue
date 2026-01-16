<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { Steps, message } from 'ant-design-vue';
import { $t } from '#/locales';

const currentStep = ref(0);

const [Modal, modalApi] = useVbenModal({
  title: $t('finance.ap.clearing'),
  fullscreen: false,
  class: 'w-[600px]',
  onConfirm: handleConfirm,
});

async function handleConfirm() {
  if (currentStep.value < 2) {
      currentStep.value++;
      return; 
  }
  
  modalApi.setLoading(true);
  setTimeout(() => {
     message.success('Clearing Document Posted');
     modalApi.close();
     modalApi.setLoading(false);
     currentStep.value = 0;
  }, 1000);
}
</script>

<template>
  <Modal>
    <div class="p-6">
      <Steps :current="currentStep" size="small" class="mb-6">
        <Steps.Step title="Select Payment" />
        <Steps.Step title="Select Invoices" />
        <Steps.Step title="Post" />
      </Steps>
      
      <div v-if="currentStep === 0" class="h-40 flex items-center justify-center bg-gray-50 border rounded text-gray-500">
         Step 1: Select Payment to Clear
      </div>
      <div v-if="currentStep === 1" class="h-40 flex items-center justify-center bg-gray-50 border rounded text-gray-500">
         Step 2: Select Open Invoices
      </div>
      <div v-if="currentStep === 2" class="h-40 flex items-center justify-center bg-gray-50 border rounded text-gray-500">
         Step 3: Confirm and Post
      </div>
    </div>
  </Modal>
</template>
