import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 后端已包含 /api 前缀，无需 rewrite
            target: 'http://10.0.0.101:30080', // K3s NodePort
            ws: true,
          },
        },
      },
    },
  };
});
