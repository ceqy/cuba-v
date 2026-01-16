<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { Page, useVbenModal } from '@vben/common-ui';
import { Input, Button, Spin, Tag, message } from 'ant-design-vue';
import { Search, Filter, Plus, Wand2, RotateCcw, UserPlus } from 'lucide-vue-next';
import { listAPOpenItems } from '#/api/finance'; // Corrected import
import WorkbenchLayout from '../common/workbench-layout.vue';
import InvoiceDetail from './modules/invoice-detail.vue';
import ClearingWizard from './modules/clearing-wizard.vue';
import SupplierModal from './components/SupplierModal.vue';

// State
const searchQuery = ref('');
const loading = ref(false);
const invoices = ref<any[]>([]); // Using any for simplicity as open-items response structure varies
const selectedInvoiceId = ref<string | null>(null);
const showClearingWizard = ref(false);

const [SupplierModalReg, supplierModalApi] = useVbenModal({
    connectedComponent: SupplierModal
});

const filteredInvoices = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return invoices.value.filter(i => 
        (i.document_reference?.document_number || '').toLowerCase().includes(q) ||
        (i.vendor_id || '').toLowerCase().includes(q)
    );
});

const selectedInvoice = computed(() => {
    return invoices.value.find(i => 
       `${i.document_reference?.document_number}` === selectedInvoiceId.value
    );
});

async function fetchOpenItems() {
  loading.value = true;
  try {
     const res: any = await listAPOpenItems({ company_code: '1000' });
     
     // Robustly handle response structure
     let list: any[] = [];
     if (Array.isArray(res)) {
         list = res;
     } else if (res && Array.isArray(res.items)) {
         list = res.items;
     } else if (res && Array.isArray(res.invoices)) {
         list = res.invoices;
     } else if (res && Array.isArray(res.open_items)) {
         list = res.open_items;
     }

     invoices.value = list.map((item: any) => ({
        ...item,
        id: item.document_reference?.document_number || item.id,
        vendor_name: item.vendor_name || `Vendor ${item.account_id || 'Unknown'}`,
        amount: Number(item.amount_in_document_currency?.value || item.amount?.value || 0),
        due_date: item.net_due_date || item.due_date,
        status: 'OPEN',
        overdue_days: calculateOverdue(item.net_due_date || item.due_date)
     }));
     
     if (invoices.value.length === 0) {
        console.warn('No invoices found in response', res);
     }
  } catch (error: any) {
     console.error(error);
     message.error('Failed to load open items');
  } finally {
     loading.value = false;
  }
}

function calculateOverdue(dateStr: string) {
    if (!dateStr) return 0;
    const due = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 0;
}

function getAgingColor(days: number) {
    if (days <= 0) return 'bg-green-500';
    if (days <= 30) return 'bg-yellow-500';
    if (days <= 60) return 'bg-orange-500';
    return 'bg-red-600';
}

function selectInvoice(id: string) {
    selectedInvoiceId.value = id;
}

function handleSupplierSuccess() {
    message.success('Ready to create invoices for new supplier');
    // Implementation for invoice creation would follow
}

onMounted(() => {
    fetchOpenItems();
});
</script>

<template>
  <Page auto-content-height>
    <WorkbenchLayout>
       <template #list>
          <div class="p-4 border-b flex gap-2">
             <Input v-model:value="searchQuery" placeholder="Search invoices..." class="flex-1">
                <template #prefix><Search class="w-4 h-4 text-gray-400" /></template>
             </Input>
             <Button><Filter class="w-4 h-4" /></Button>
             <Button type="primary" @click="fetchOpenItems"><RotateCcw class="w-4 h-4" /></Button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
              <div v-if="loading" class="text-center py-4"><Spin /></div>
              
              <div 
                v-for="invoice in filteredInvoices" 
                :key="invoice.id"
                class="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all relative overflow-hidden"
                :class="{'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedInvoiceId === invoice.id}"
                @click="selectInvoice(invoice.id)"
              >
                <!-- Aging Strip -->
                <div :class="['absolute left-0 top-0 bottom-0 w-1', getAgingColor(invoice.overdue_days)]"></div>

                <div class="pl-2">
                    <div class="flex justify-between items-start">
                        <span class="font-medium text-sm truncate">{{ invoice.vendor_name }}</span>
                        <span class="font-mono text-sm">{{ invoice.amount.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                         <span class="text-xs text-gray-500">{{ invoice.document_reference?.document_number }}</span>
                         <span v-if="invoice.overdue_days > 0" class="text-xs text-red-500 font-bold">
                            +{{ invoice.overdue_days }}d
                         </span>
                         <Tag v-else color="green" class="text-[10px] m-0">Current</Tag>
                    </div>
                </div>
              </div>
          </div>
       </template>

       <template #detail>
          <div v-if="selectedInvoice" class="h-full">
              <InvoiceDetail :invoice="selectedInvoice" />
          </div>
          <div v-else class="h-full flex items-center justify-center text-gray-400">
              Select an invoice to view details
          </div>
       </template>
       
       <template #actions>
          <Button class="mr-2" @click="supplierModalApi.open()">
             <UserPlus class="w-4 h-4 mr-2" />
             New Supplier
          </Button>
          <Button class="mr-2">
             <Plus class="w-4 h-4 mr-2" />
             New Invoice
          </Button>
          <Button type="primary" @click="showClearingWizard = true">
             <Wand2 class="w-4 h-4 mr-2" />
             Clear Open Items
          </Button>
       </template>
    </WorkbenchLayout>
    
    <ClearingWizard 
       v-model:open="showClearingWizard" 
       :open-items="invoices"
       @refresh="fetchOpenItems"
    />
    <SupplierModalReg @success="handleSupplierSuccess" />
  </Page>
</template>
