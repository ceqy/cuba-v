import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:banknote',
      order: 2000,
      title: '财务管理',
    },
    name: 'Finance',
    path: '/finance',
    children: [
      {
        name: 'GeneralLedger',
        path: 'gl',
        component: () => import('#/views/finance/gl/index.vue'),
        meta: {
          icon: 'lucide:book-open',
          title: '总账 (GL)',
        },
      },
      {
        name: 'AccountsPayable',
        path: 'ap',
        component: () => import('#/views/finance/ap/index.vue'),
        meta: {
          icon: 'lucide:credit-card',
          title: '应付 (AP)',
        },
      },
      {
        name: 'AccountsReceivable',
        path: 'ar',
        component: () => import('#/views/finance/ar/index.vue'),
        meta: {
          icon: 'lucide:coins',
          title: '应收 (AR)',
        },
      },
      {
        name: 'Controlling',
        path: 'co',
        component: () => import('#/views/finance/co/index.vue'),
        meta: {
          icon: 'lucide:pie-chart',
          title: '成本控制 (CO)',
        },
      },
      {
        name: 'Treasury',
        path: 'tr',
        component: () => import('#/views/finance/tr/index.vue'),
        meta: {
          icon: 'lucide:landmark',
          title: '资金管理 (TR)',
        },
      },
    ],
  },
];

export default routes;
