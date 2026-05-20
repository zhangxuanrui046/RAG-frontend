[file name]: ChatInput.vue
[file content begin]
<template>
  <div class="chat-input-container">
    <div class="input-header">
      <div class="search-toggle">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            v-model="enableSearch" 
            :disabled="loading"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">联网搜索</span>
        </label>
      </div>
    </div>
    
    <textarea
      v-model="message"
      class="chat-input"
      :placeholder="enableSearch ? '请输入搜索关键词...（示例：系统缓存优化方案）' : '请输入故障日志内容...（示例：系统缓存命中率 < 50%，内存使用率 > 80%）'"
      @keyup.enter.exact="sendMessage"
      @keyup.enter.shift="addNewline"
      :disabled="loading"
      rows="3"
    ></textarea>
    
    <div class="input-actions">
      <button 
        class="search-btn" 
        @click="sendWithSearch"
        :disabled="!message.trim() || loading"
        :class="{ active: enableSearch }"
        title="使用联网搜索发送"
      >
        <span v-if="loading && enableSearch" class="loading-dots">
          <span></span><span></span><span></span>
        </span>
        <span v-else>
          🔍 {{ enableSearch ? '搜索发送' : '普通发送' }}
        </span>
      </button>
      
      <button 
        class="clear-btn" 
        @click="clearInput"
        :disabled="!message.trim() || loading"
      >
        清除
      </button>
      
      <button 
        class="send-btn" 
        @click="sendMessage"
        :disabled="!message.trim() || loading"
      >
        <span v-if="loading && !enableSearch" class="loading-dots">
          <span></span><span></span><span></span>
        </span>
        <span v-else>发送</span>
      </button>
    </div>
    
    <div v-if="enableSearch" class="search-notice">
      <span class="search-icon">🔍</span>
      <span>已启用联网搜索，将获取最新网络信息</span>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, nextTick } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['send', 'search']);

const message = ref('');
const enableSearch = ref(false);

const sendMessage = () => {
  const content = message.value.trim();
  if (content && !props.loading) {
    if (enableSearch.value) {
      emits('search', content);
    } else {
      emits('send', content);
    }
    message.value = '';
  }
};

const sendWithSearch = () => {
  const content = message.value.trim();
  if (content && !props.loading) {
    emits('search', content);
    message.value = '';
  }
};

const clearInput = () => {
  if (message.value.trim() && !props.loading && confirm('确定清空输入内容吗？')) {
    message.value = '';
  }
};

const addNewline = (event) => {
  event.preventDefault();
  const cursorPos = event.target.selectionStart;
  const textBefore = message.value.substring(0, cursorPos);
  const textAfter = message.value.substring(cursorPos);
  message.value = textBefore + '\n' + textAfter;
  
  nextTick(() => {
    event.target.selectionStart = event.target.selectionEnd = cursorPos + 1;
  });
};
</script>

<style scoped>
/* 样式保持不变 */
.chat-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 2px solid #f0f0f0;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.input-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.search-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.toggle-label input {
  display: none;
}

.toggle-slider {
  width: 40px;
  height: 20px;
  background: #ddd;
  border-radius: 20px;
  position: relative;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-label input:checked + .toggle-slider {
  background: #4f46e5;
}

.toggle-label input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-text {
  font-weight: 500;
}

.chat-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.chat-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.search-btn, .clear-btn, .send-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn {
  background: #10b981;
  color: white;
  margin-right: auto;
}

.search-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.search-btn.active {
  background: #dc2626;
}

.search-btn.active:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.clear-btn {
  background: #6c757d;
  color: white;
}

.clear-btn:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.send-btn {
  background: #007bff;
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.search-btn:disabled, .clear-btn:disabled, .send-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.search-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: var(--radius);
  color: #1e40af;
  font-size: 0.875rem;
}

.search-icon {
  font-size: 1rem;
}

.loading-dots {
  display: flex;
  gap: 0.25rem;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: loading-dots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-dots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-actions {
    flex-wrap: wrap;
  }
  
  .search-btn, .clear-btn, .send-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
[file content end]
