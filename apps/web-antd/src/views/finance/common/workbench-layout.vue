<script lang="ts" setup>
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full w-full border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <!-- Left Panel: List -->
      <div class="w-1/3 min-w-[350px] border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 font-bold bg-gray-50 dark:bg-gray-900">
          <slot name="listTitle">List</slot>
        </div>
        <div class="flex-1 overflow-y-auto">
          <slot name="list"></slot>
        </div>
        <div class="p-2 border-t border-gray-200 dark:border-gray-800">
           <slot name="pagination"></slot>
        </div>
      </div>

      <!-- Right Panel: Detail -->
      <div class="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50">
         <div class="flex-1 overflow-y-auto p-6" >
            <slot name="detail"></slot>
         </div>
      </div>
    </div>
  </Page>
</template>
