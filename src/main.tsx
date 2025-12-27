/**
 * 应用入口文件
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logger } from './shared/utils/logger';

// 初始化IndexedDB
import { db } from './services/storage/indexedDB';

// 监听网络状态
import { onNetworkStatusChange } from './shared/utils/helpers';
import { useAppStore } from './store/app-store';

// 初始化数据库
async function initializeApp() {
  try {
    await db.open();
    logger.log('✅ IndexedDB initialized successfully');

    onNetworkStatusChange((status) => {
      useAppStore.getState().setNetworkStatus(status);
      logger.log(`🌐 Network status: ${status}`);
    });

    await useAppStore.getState().loadFromStorage();
    logger.log('✅ Data loaded from storage');

  } catch (error) {
    logger.error('❌ App initialization failed:', error);
  }
}

// 渲染应用
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

initializeApp().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// 注册Service Worker（PWA）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        logger.log('✅ ServiceWorker registered: ', registration);
      },
      (registrationError) => {
        logger.error('❌ ServiceWorker registration failed: ', registrationError);
      }
    );
  });
}
