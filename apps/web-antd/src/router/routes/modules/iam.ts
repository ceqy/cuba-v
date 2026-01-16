import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:shield', // Using a shield icon for IAM/Security
      order: 1000,
      title: 'IAM', // Or use translation key if available, e.g. $t('page.iam.title')
    },
    name: 'IAM',
    path: '/iam',
    children: [
      {
        name: 'UserManagement',
        path: 'users',
        component: () => import('#/views/iam/users/index.vue'),
        meta: {
          title: $t('iam.user.list'),
        },
      },
      {
        name: 'RoleManagement',
        path: 'roles',
        component: () => import('#/views/iam/roles/index.vue'),
        meta: {
          title: $t('iam.role.list'),
        },
      },
      {
        name: 'PermissionManagement',
        path: 'permissions',
        component: () => import('#/views/iam/permissions/index.vue'),
        meta: {
          title: $t('iam.permission.list'),
        },
      },
      {
        name: 'OAuthClientManagement',
        path: 'oauth-clients',
        component: () => import('#/views/iam/oauth-clients/index.vue'),
        meta: {
          title: $t('iam.oauth_client.list'),
        },
      },
    ],
  },
];

export default routes;
