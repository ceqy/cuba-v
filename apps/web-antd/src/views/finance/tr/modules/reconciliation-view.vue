<script lang="ts" setup>
import { ref } from 'vue';
import { Button, Tag, message } from 'ant-design-vue';
import { ArrowRightLeft } from 'lucide-vue-next';

// Mock Data
const bankLines = ref([
    { id: 1, date: '2024-01-15', desc: 'Wire Transfer - Client A', amount: 1200.00, matched: false },
    { id: 2, date: '2024-01-16', desc: 'Bank Fee', amount: -25.00, matched: false },
    { id: 3, date: '2024-01-16', desc: 'Check #1001', amount: -500.00, matched: false },
]);

const systemLines = ref([
    { id: 101, date: '2024-01-14', desc: 'Inv-2024001 Pmt', amount: 1200.00, matched: false },
    { id: 102, date: '2024-01-15', desc: 'Payment to Vendor X', amount: -500.00, matched: false },
    { id: 103, date: '2024-01-16', desc: 'Service Fee', amount: -25.00, matched: false },
]);

const selectedBankId = ref<number | null>(null);

function autoMatch() {
    // Simple mock matching logic
    bankLines.value.forEach(b => {
        const match = systemLines.value.find(s => s.amount === b.amount && !s.matched);
        if (match) {
            b.matched = true;
            match.matched = true;
        }
    });
    message.success('Auto-match completed. 3 items matched.');
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-4 flex justify-between items-center">
       <div class="font-bold text-lg">Bank Reconciliation: Jan 2024</div>
       <Button type="primary" @click="autoMatch">
          <template #icon><ArrowRightLeft class="w-4 h-4" /></template>
          Auto Match
       </Button>
    </div>

    <div class="flex-1 flex gap-4 overflow-hidden border rounded bg-white dark:bg-gray-800">
       <!-- Bank Side -->
       <div class="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div class="p-3 bg-gray-100 dark:bg-gray-900 font-bold border-b">Bank Statement (External)</div>
          <div class="flex-1 overflow-y-auto">
             <div 
                v-for="item in bankLines" 
                :key="item.id"
                class="p-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                :class="{'opacity-50': item.matched, 'bg-blue-50': selectedBankId === item.id}"
                @click="selectedBankId = item.id"
             >
                <div>
                   <div class="text-sm font-medium">{{ item.desc }}</div>
                   <div class="text-xs text-gray-500">{{ item.date }}</div>
                </div>
                <div class="flex items-center gap-2">
                   <span :class="item.amount > 0 ? 'text-green-600' : 'text-red-600'" class="font-mono">
                      {{ item.amount.toFixed(2) }}
                   </span>
                   <Tag v-if="item.matched" color="green">Matched</Tag>
                </div>
             </div>
          </div>
       </div>

       <!-- System Side -->
       <div class="w-1/2 flex flex-col">
          <div class="p-3 bg-gray-100 dark:bg-gray-900 font-bold border-b">System Ledger (Internal)</div>
          <div class="flex-1 overflow-y-auto">
             <div 
                v-for="item in systemLines" 
                :key="item.id"
                class="p-3 border-b flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                :class="{'opacity-50': item.matched}"
             >
                <div>
                   <div class="text-sm font-medium">{{ item.desc }}</div>
                   <div class="text-xs text-gray-500">{{ item.date }}</div>
                </div>
                <div class="flex items-center gap-2">
                   <span :class="item.amount > 0 ? 'text-green-600' : 'text-red-600'" class="font-mono">
                      {{ item.amount.toFixed(2) }}
                   </span>
                   <Tag v-if="item.matched" color="green">Matched</Tag>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>
