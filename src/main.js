import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 在挂载应用前强制注入样式
const enforceStyles = () => {
  // 创建强制样式
  const style = document.createElement('style');
  style.id = 'enforced-styles';
  style.textContent = `
    /* 强制所有元素使用4px圆角 */
    *:not(.markdown-content *) {
      border-radius: 4px !important;
    }
    
    /* 强制按钮样式 */
    button, 
    button.primary, 
    button.secondary, 
    button.danger,
    .search-btn,
    .clear-btn, 
    .send-btn,
    input, 
    textarea,
    .card,
    .error-message,
    .session-item,
    .chat-input,
    .markdown-container,
    .dialog,
    .login-button {
      border-radius: 4px !important;
    }
    
    /* 强制按钮悬停效果 */
    button:hover:not(:disabled),
    .search-btn:hover:not(:disabled),
    .clear-btn:hover:not(:disabled),
    .send-btn:hover:not(:disabled),
    .primary:hover:not(:disabled),
    .secondary:hover:not(:disabled),
    .danger:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
    }
    
    /* 强制按钮禁用状态 */
    button:disabled,
    .search-btn:disabled,
    .clear-btn:disabled,
    .send-btn:disabled {
      background-color: #9ca3af !important;
      cursor: not-allowed !important;
      opacity: 0.6 !important;
      transform: none !important;
      box-shadow: none !important;
    }
    
    /* 强制输入框聚焦效果 */
    input:focus, 
    textarea:focus,
    .chat-input:focus {
      outline: 2px solid #4f46e5 !important;
      outline-offset: 1px !important;
      border-color: #4f46e5 !important;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
    }
    
    /* 强制会话项悬停效果 */
    .session-item:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
    
    /* 强制错误消息边框 */
    .error-message {
      border: 2px solid rgba(239, 68, 68, 0.3) !important;
    }
    
    /* 强制卡片阴影 */
    .card,
    .markdown-container,
    .chat-input-container {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }
    
    /* 强制无障碍焦点样式 */
    button:focus, 
    input:focus, 
    textarea:focus,
    [tabindex]:focus {
      outline: 3px solid #4f46e5 !important;
      outline-offset: 2px !important;
    }
  `;
  
  // 添加到文档头
  document.head.appendChild(style);
  
  console.log('🎨 强制样式已注入');
};

// 应用挂载前的准备工作
const initializeApp = () => {
  // 注入强制样式
  enforceStyles();
  
  // 添加全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue 错误:', err, '在组件:', instance, '信息:', info);
  };
  
  // 添加全局属性（如果需要）
  app.config.globalProperties.$filters = {
    formatDate(value) {
      if (!value) return '';
      return new Date(value).toLocaleDateString('zh-CN');
    }
  };
  
  console.log('🚀 GPT4o-RAG 应用初始化完成');
};

// 执行初始化
initializeApp();

// 挂载应用
app.mount('#app');

// 应用挂载后的操作
const postMountOperations = () => {
  // 检查样式是否应用成功
  setTimeout(() => {
    const testButton = document.querySelector('button');
    if (testButton) {
      const borderRadius = getComputedStyle(testButton).borderRadius;
      console.log('✅ 按钮圆角检查:', borderRadius);
      
      if (borderRadius === '4px') {
        console.log('🎉 圆角优化已成功应用');
      } else {
        console.warn('⚠️ 圆角优化可能未完全应用，当前值:', borderRadius);
      }
    }
  }, 1000);
};

// 监听应用挂载完成
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const appElement = document.getElementById('app');
      if (appElement && appElement.children.length > 0) {
        postMountOperations();
        observer.disconnect();
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
