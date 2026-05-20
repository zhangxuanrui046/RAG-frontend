<template>
  <div class="session-list">
    <div class="session-list-header">
      <h2>会话</h2>
      <button class="primary" @click="showNewSessionDialog = true">
        +
      </button>
    </div>
    
    <div class="session-items">
      <div
        v-for="session in sessions"
        :key="session"
        class="session-item"
        :class="{ active: session === currentSession }"
        @click="selectSession(session)"
      >
        <div class="session-name">{{ session }}</div>
        <button 
          class="delete-btn" 
          @click.stop="deleteSession(session)"
          title="删除会话"
        >
          ×
        </button>
      </div>
    </div>
    
    <!-- 新建会话对话框 -->
    <div v-if="showNewSessionDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>新建会话</h3>
        <input
          type="text"
          v-model="newSessionName"
          placeholder="输入会话名称"
          @keyup.enter="createSession"
        />
        <div class="dialog-buttons">
          <button class="secondary" @click="showNewSessionDialog = false">取消</button>
          <button class="primary" @click="createSession">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  sessions: {
    type: Array,
    required: true
  },
  currentSession: {
    type: String,
    required: true
  }
});

const emits = defineEmits(['select', 'delete', 'create']);

const showNewSessionDialog = ref(false);
const newSessionName = ref('');

const selectSession = (session) => {
  emits('select', session);
};

const deleteSession = (session) => {
  if (confirm(`确定要删除会话 "${session}" 吗？`)) {
    emits('delete', session);
  }
};

const createSession = () => {
  if (newSessionName.value.trim()) {
    emits('create', newSessionName.value.trim());
    newSessionName.value = '';
    showNewSessionDialog.value = false;
  }
};
</script>

<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.session-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--card-bg);
}

.session-list-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.session-list-header button {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.session-list-header button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.session-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 0;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: var(--card-bg);
}

.session-item:hover {
  background: #e3f2fd;
  border-color: var(--border-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.session-item.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.02);
  border: 2px solid var(--primary-color);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.session-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  opacity: 0.7;
  display: none;
  cursor: pointer;
  color: inherit;
  font-size: 1.2rem;
  line-height: 1;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.session-item:hover .delete-btn {
  display: block;
}

.session-item.active .delete-btn {
  color: white;
}

.delete-btn:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  margin: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.dialog h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--text-primary);
  text-align: center;
}

.dialog input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  margin-bottom: 1rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.dialog input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.secondary {
  background-color: var(--border-color);
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.secondary:hover {
  background-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 滚动条样式 */
.session-items::-webkit-scrollbar {
  width: 6px;
}

.session-items::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 3px;
}

.session-items::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.session-items::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .session-list-header {
    padding: 0.75rem;
  }
  
  .session-list-header h2 {
    font-size: 1.1rem;
  }
  
  .session-item {
    padding: 0.6rem;
    margin-bottom: 0.25rem;
  }
  
  .dialog {
    margin: 0.5rem;
    padding: 1.25rem;
  }
}
</style>
