<script lang="ts" setup>
import type { InvoiceItem } from '../data';
import { defineProps } from 'vue';
import { Tag } from 'ant-design-vue';

defineProps<{
  invoice: InvoiceItem;
}>();
</script>

<template>
  <div class="h-full">
    <div class="border-b pb-4 mb-4 flex justify-between items-start">
      <div>
        <h2 class="text-xl font-bold mb-1">{{ invoice.customer_name }}</h2>
        <p class="text-gray-500 text-sm">Invoice #: {{ invoice.invoice_number }}</p>
      </div>
      <div class="text-right">
        <h2 class="text-2xl font-mono mb-1">{{ invoice.amount.toLocaleString() }}</h2>
         <Tag color="red" v-if="invoice.overdue_days > 0">Overdue {{ invoice.overdue_days }} days</Tag>
         <Tag color="blue" v-else>Current</Tag>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
       <div>
         <label class="block text-xs text-gray-500 uppercase">Due Date</label>
         <span class="font-medium">{{ invoice.due_date }}</span>
       </div>
       <div>
         <label class="block text-xs text-gray-500 uppercase">Status</label>
         <span class="font-medium">{{ invoice.status }}</span>
       </div>
    </div>

    <!-- Placeholder for Invoice Line Items (Drill-down from GL would go here too) -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded border">
      <h3 class="font-bold mb-2">Line Items</h3>
       <p class="text-gray-500 italic">Invoice line items would appear here...</p>
    </div>
  </div>
</template>
