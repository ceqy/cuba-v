<script lang="ts" setup>
import type { JournalEntryLineItem } from '#/api/finance/types';
import { onMounted, ref, watch } from 'vue';
import { Spin, message } from 'ant-design-vue';
import { getJournalEntry } from '#/api/finance/gl';

const props = defineProps<{
  entryId: string;
}>();

const loading = ref(false);
const items = ref<JournalEntryLineItem[]>([]);

async function fetchDetails() {
  if (!props.entryId) return;
  
  loading.value = true;
  try {
    const data = await getJournalEntry(props.entryId);
    items.value = data.line_items || [];
  } catch (error: any) {
    message.error(`Failed to load details: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

watch(() => props.entryId, fetchDetails);

onMounted(fetchDetails);

function getDebit(item: JournalEntryLineItem) {
    return item.debit_credit_indicator === 'S' ? item.amount_in_document_currency.value : '';
}

function getCredit(item: JournalEntryLineItem) {
    return item.debit_credit_indicator === 'H' ? item.amount_in_document_currency.value : '';
}

function formatAmount(val: string) {
    return val ? Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
}
</script>

<template>
  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
    <div v-if="loading" class="text-center py-4">
        <Spin />
    </div>
    <div v-else>
        <h4 class="mb-2 text-sm font-bold text-gray-500">Line Items</h4>
        <table class="w-full text-sm">
        <thead>
            <tr class="text-left text-gray-500">
            <th class="pb-2">Line</th>
            <th class="pb-2">PK</th>
            <th class="pb-2">Account</th>
            <th class="pb-2">Text</th>
            <th class="pb-2 text-right">Debit</th>
            <th class="pb-2 text-right">Credit</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in items" :key="index" class="border-t border-gray-200 dark:border-gray-700">
            <td class="py-2 text-gray-500">{{ item.line_item_number }}</td>
            <td class="py-2 w-10 text-gray-500">{{ item.posting_key }}</td>
            <td class="py-2">
                <span class="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded mr-2">{{ item.gl_account }}</span>
            </td>
            <td class="py-2 text-gray-600 truncate max-w-[200px]">{{ item.text }}</td>
            <td class="py-2 text-right font-mono">{{ formatAmount(getDebit(item)) }}</td>
            <td class="py-2 text-right font-mono">{{ formatAmount(getCredit(item)) }}</td>
            </tr>
        </tbody>
        </table>
    </div>
  </div>
</template>
