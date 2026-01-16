<script lang="ts" setup>
import type { CreateJournalEntryRequest } from '#/api/finance/types';
import { computed, ref } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { Button, Input, InputNumber, Select, message, Segmented } from 'ant-design-vue';
import { Trash2 } from 'lucide-vue-next';
import { createJournalEntry } from '#/api/finance/gl';
import { useFormSchema } from '../data';
import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

// Internal state for line items
interface LocalLineItem {
  id: number;
  posting_key: string; // 40 or 50
  account_code: string;
  amount: number;
  description: string;
  cost_center?: string;
}

const lineItems = ref<LocalLineItem[]>([
  { id: 1, posting_key: '40', account_code: '', amount: 0, description: '' },
  { id: 2, posting_key: '50', account_code: '', amount: 0, description: '' },
]);

// Form Definition
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showActionButtonGroup: false,
  labelWidth: 100,
  wrapperClass: 'grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  title: $t('finance.gl.create_entry'),
  onConfirm: handleSubmit,
  class: 'w-[800px]',
});

// Computed Totals
const totalDebit = computed(() => {
  return lineItems.value
    .filter(i => i.posting_key === '40')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
});

const totalCredit = computed(() => {
  return lineItems.value
    .filter(i => i.posting_key === '50')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
});

const balance = computed(() => totalDebit.value - totalCredit.value);
const isBalanced = computed(() => Math.abs(balance.value) < 0.01);

// Actions
function addLineItem() {
  const nextId = Math.max(...lineItems.value.map(i => i.id)) + 1;
  // Default to balance the entry
  const nextKey = balance.value > 0 ? '50' : '40'; 
  lineItems.value.push({
    id: nextId,
    posting_key: nextKey, 
    account_code: '',
    amount: Math.abs(balance.value),
    description: ''
  });
}

function removeLineItem(index: number) {
  if (lineItems.value.length <= 2) {
    message.warning('At least 2 line items are required.');
    return;
  }
  lineItems.value.splice(index, 1);
}

async function handleSubmit() {
  if (!isBalanced.value) {
    message.error(`Entry is not balanced! Diff: ${balance.value.toFixed(2)}`);
    return;
  }
  
  try {
    // Validate Header Form
    await formApi.validate();
    const values = await formApi.getValues();
    
    drawerApi.setLoading(true);
    
    // Transform to API Payload
    const payload: CreateJournalEntryRequest = {
      header: {
          company_code: values.company_code,
          document_type: values.document_type,
          document_date: values.document_date ? new Date(values.document_date).toISOString().split('T')[0] : '',
          posting_date: values.posting_date ? new Date(values.posting_date).toISOString().split('T')[0] : '',
          fiscal_year: Number(values.fiscal_year),
          fiscal_period: Number(values.fiscal_period),
          currency: values.currency,
          header_text: values.header_text,
      },
      line_items: lineItems.value.map((item, index) => {
          const isDebit = item.posting_key === '40';
          return {
              line_item_number: index + 1,
              posting_key: item.posting_key,
              debit_credit_indicator: isDebit ? 'S' : 'H',
              gl_account: item.account_code,
              amount_in_document_currency: {
                  currency_code: values.currency,
                  value: item.amount.toFixed(2)
              },
              text: item.description,
              cost_center: item.cost_center
          };
      }),
      post_immediately: true,
    };

    console.log('Posting Journal Entry:', payload);
    await createJournalEntry(payload);
    
    message.success('Journal Entry Posted!');
    emit('success');
    drawerApi.close();
    
    // Reset
    formApi.resetValues();
    lineItems.value = [
       { id: 1, posting_key: '40', account_code: '', amount: 0, description: '' },
       { id: 2, posting_key: '50', account_code: '', amount: 0, description: '' },
    ];
    
  } catch (error: any) {
    console.error(error);
    message.error(`Failed to post: ${error.message || 'Unknown error'}`);
  } finally {
    drawerApi.setLoading(false);
  }
}
</script>

<template>
  <Drawer>
    <!-- Header Form -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
       <h3 class="font-bold mb-4">Header Data</h3>
       <Form />
    </div>

    <!-- Line Items Table -->
    <div class="mb-4">
       <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold">Line Items</h3>
          <Button type="dashed" size="small" @click="addLineItem">Add Line</Button>
       </div>

       <div class="space-y-2">
          <div 
             v-for="(item, index) in lineItems" 
             :key="item.id" 
             class="flex gap-2 items-start p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
             <div class="w-24">
                <Select v-model:value="item.posting_key" class="w-full" size="small">
                    <Select.Option value="40">40 (Dr)</Select.Option>
                    <Select.Option value="50">50 (Cr)</Select.Option>
                </Select>
             </div>
             
             <Input v-model:value="item.account_code" placeholder="GL Account" class="w-32" size="small" />
             <Input v-model:value="item.description" placeholder="Description" class="flex-1" size="small" />
             <InputNumber v-model:value="item.amount" :min="0" :precision="2" placeholder="Amount" class="w-32" size="small" />
             
             <Button type="text" danger size="small" @click="removeLineItem(index)">
                <Trash2 class="w-4 h-4" />
             </Button>
          </div>
       </div>
    </div>

    <!-- Footer / Balance Check -->
    <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded flex justify-between items-center font-mono">
       <div>
         <span class="text-green-600 mr-4">Total Debit: {{ totalDebit.toFixed(2) }}</span>
         <span class="text-red-600">Total Credit: {{ totalCredit.toFixed(2) }}</span>
       </div>
       <div :class="isBalanced ? 'text-green-600' : 'text-red-500'" class="font-bold text-lg">
          Balance: {{ balance.toFixed(2) }}
       </div>
    </div>
  </Drawer>
</template>
