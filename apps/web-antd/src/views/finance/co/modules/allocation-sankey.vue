<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, watch } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps<{
  simulationData?: any;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const mockData = {
  nodes: [
    { name: 'Total Costs' },
    { name: 'Admin Dept' },
    { name: 'IT Dept' },
    { name: 'Product A' },
    { name: 'Product B' },
    { name: 'Product C' }
  ],
  links: [
    { source: 'Total Costs', target: 'Admin Dept', value: 5000 },
    { source: 'Total Costs', target: 'IT Dept', value: 8000 },
    { source: 'Admin Dept', target: 'Product A', value: 2000 },
    { source: 'Admin Dept', target: 'Product B', value: 2000 },
    { source: 'Admin Dept', target: 'Product C', value: 1000 },
    { source: 'IT Dept', target: 'Product A', value: 4000 },
    { source: 'IT Dept', target: 'Product B', value: 3000 },
    { source: 'IT Dept', target: 'Product C', value: 1000 },
  ]
};

function updateChart() {
    renderEcharts({
    title: {
      text: 'Cost Allocation Flow (Simulation)',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        data: mockData.nodes,
        links: mockData.links,
        emphasis: {
          focus: 'adjacency'
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
         label: {
            position: 'right',
            color: '#000',
            fontSize: 12
         }
      }
    ]
  });
}

onMounted(() => {
    updateChart();
    
    // Add Drill-down
    const chart = chartRef.value?.getInstance();
    if (chart) {
        chart.on('click', (params: any) => {
             // Mock navigation to GL
             console.log('Drill to GL for:', params.name);
             // router.push({ name: 'GeneralLedger', query: { cost_center: params.name } });
             // Since we don't have router instance here easily without proper injection, 
             // we'll just log it for this demo or use window.location
        });
    }
});

watch(() => props.simulationData, () => {
    // In real app, we would update chart data here
    updateChart();
});
</script>

<template>
  <div class="h-[500px] w-full bg-white dark:bg-gray-800 p-4 rounded-lg border">
    <EchartsUI ref="chartRef" />
  </div>
</template>
