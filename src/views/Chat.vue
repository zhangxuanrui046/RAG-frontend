[file name]: Chat.vue
[file content begin]
<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="app-header">
        <h2 class="app-title">gpt4o-RAG</h2>
        <div class="app-version">v1.0.0</div>
      </div>
      
      <SessionList
        :sessions="store.sessions"
        :current-session="store.currentSession"
        @select="handleSelectSession"
        @delete="handleDeleteSession"
        @create="handleCreateSession"
      />
      
      <div class="user-info">
        <div class="storage-info" v-if="storageStats">
          <div class="storage-stats">
            <span>会话: {{ storageStats.sessionsCount }}</span>
            <span>消息: {{ storageStats.totalMessages }}</span>
            <span>存储: {{ storageStats.storageSize }}</span>
            <span>当前会话消息: {{ storageStats.currentSessionMessages }}</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="secondary" @click="handleClearHistory">
            🗑️ 清空当前会话
          </button>
          <button class="secondary" @click="handleExportChat">
            💾 导出聊天记录
          </button>
          <button class="danger" @click="handleLogout">
            🚪 退出登录
          </button>
        </div>
      </div>
    </div>
    
    <div class="chat-area">
      <div class="chat-header">
        <div class="chat-title">
          <h1>gpt4o-RAG 智能助手</h1>
          <p class="chat-subtitle">基于 RAG 技术的智能对话系统</p>
        </div>
        <div class="session-info">
          <span class="session-badge">当前会话</span>
          <span class="session-name">{{ store.currentSession }}</span>
        </div>
      </div>
      
      <div v-if="store.error" class="error-message">{{ store.error }}</div>
      
      <div class="messages-container" ref="messagesContainer">
        <div v-if="currentMessages.length === 0" class="empty-state">
          开始与 gpt4o-RAG 的对话吧！
        </div>
        
        <ChatMessage
          v-for="msg in currentMessages"
          :key="msg.id"
          :is-user="msg.isUser"
          :content="msg.content"
          :timestamp="msg.timestamp"
        />
        
        <div v-if="store.loading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p>gpt4o-RAG 正在思考...</p>
        </div>
      </div>
      
      <ChatInput
        :loading="store.loading || isStreaming"
        @send="handleSendMessage"
        @search="handleSearchMessage"
      />

      <!-- 导出对话框 -->
      <div v-if="showExportDialog" class="dialog-overlay">
        <div class="dialog">
          <h3>导出聊天记录</h3>
          <textarea 
            v-model="exportData" 
            readonly 
            rows="10"
            placeholder="聊天数据将在这里显示..."
          ></textarea>
          <div class="dialog-buttons">
            <button class="secondary" @click="copyExportData">📋 复制</button>
            <button class="secondary" @click="showExportDialog = false">关闭</button>
          </div>
        </div>
      </div>

      <!-- 导入对话框 -->
      <div v-if="showImportDialog" class="dialog-overlay">
        <div class="dialog">
          <h3>导入聊天记录</h3>
          <textarea 
            v-model="importData" 
            placeholder="请粘贴之前导出的聊天数据..."
            rows="10"
          ></textarea>
          <div class="dialog-buttons">
            <button class="primary" @click="handleImportChat">导入</button>
            <button class="secondary" @click="showImportDialog = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
import api from '../api'
import SessionList from '../components/SessionList.vue'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'

const store = useStore()
const router = useRouter()
const messagesContainer = ref(null)

// 对话框状态
const showExportDialog = ref(false)
const showImportDialog = ref(false)
const exportData = ref('')
const importData = ref('')

// 流式输出相关状态
const isStreaming = ref(false)
const streamingMessageId = ref(null)
const streamingInterval = ref(null)

// 计算属性
const currentMessages = computed(() => {
  const messages = store.messages[store.currentSession] || []
  return messages
})

const storageStats = computed(() => {
  return store.getStorageStats()
})

// 自动滚动到底部
watch(currentMessages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

// 模拟流式输出的函数
const simulateStreaming = (fullContent, messageId, speed = 20) => {
  return new Promise((resolve) => {
    if (!fullContent || fullContent.trim() === '') {
      resolve('')
      return
    }

    let currentIndex = 0
    const content = fullContent.trim()
    
    // 清除之前的定时器
    if (streamingInterval.value) {
      clearInterval(streamingInterval.value)
    }

    streamingInterval.value = setInterval(() => {
      if (currentIndex <= content.length) {
        const partialContent = content.substring(0, currentIndex)
        store.updateMessageContent(store.currentSession, messageId, partialContent)
        currentIndex++
        
        // 自动滚动
        nextTick(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
          }
        })
      } else {
        clearInterval(streamingInterval.value)
        streamingInterval.value = null
        resolve(content)
      }
    }, speed)
  })
}

// 停止流式输出
const stopStreaming = () => {
  if (streamingInterval.value) {
    clearInterval(streamingInterval.value)
    streamingInterval.value = null
  }
  isStreaming.value = false
  streamingMessageId.value = null
}

// 提取函数
const extractActualReply = (fullReply) => {
  if (!fullReply) {
    return '抱歉，没有收到回复内容。'
  }
  
  if (fullReply.includes('💡 **最终回答**:')) {
    const finalAnswerMatch = fullReply.match(/💡 \*\*最终回答\*\*:\s*\n([\s\S]*?)$/)
    if (finalAnswerMatch && finalAnswerMatch[1]) {
      return finalAnswerMatch[1].trim()
    }
  }
  
  const markdownBlockMatch = fullReply.match(/```markdown\s*([\s\S]*?)```/)
  if (markdownBlockMatch && markdownBlockMatch[1]) {
    return markdownBlockMatch[1].trim()
  }
  
  const anyCodeBlockMatch = fullReply.match(/```(?:\w+)?\s*([\s\S]*?)```/)
  if (anyCodeBlockMatch && anyCodeBlockMatch[1]) {
    return anyCodeBlockMatch[1].trim()
  }
  
  let cleaned = fullReply
  if (cleaned.includes('<think>') && cleaned.includes('</think>')) {
    const thinkEnd = cleaned.indexOf('</think>') + 8
    cleaned = cleaned.substring(thinkEnd).trim()
  }
  
  return cleaned
}

// 处理普通消息发送
const handleSendMessage = async (content) => {
  if (isStreaming.value) {
    console.warn('⚠️ 已有消息在流式输出中，忽略重复请求')
    return
  }
  
  isStreaming.value = true

  try {
    // 1. 添加用户消息
    const userMessageId = store.addMessage(store.currentSession, true, content)

    // 2. 添加空的AI消息用于流式更新
    const aiMessageId = store.addMessage(store.currentSession, false, '')
    streamingMessageId.value = aiMessageId

    store.setLoading(true)

    // 3. 调用API获取完整回复
    const response = await api.chat(store.currentSession, content)
    
    if (!response.data || !response.data.reply) {
      throw new Error('API返回数据格式错误')
    }

    // 4. 提取回复内容
    const fullReply = extractActualReply(response.data.reply)

    if (!fullReply || fullReply.trim() === '') {
      throw new Error('回复内容为空')
    }

    // 5. 开始前端流式输出
    await simulateStreaming(fullReply, aiMessageId, 15)

  } catch (err) {
    console.error('❌ 发送消息失败:', err)
    const errorMsg = err.response?.data?.error || err.message || '发送消息失败'
    store.setError(errorMsg)
    
    // 添加错误消息到对话
    if (streamingMessageId.value) {
      store.updateMessageContent(store.currentSession, streamingMessageId.value, `❌ 错误: ${errorMsg}`)
    }
  } finally {
    store.setLoading(false)
    stopStreaming()
  }
}

// 处理搜索消息
const handleSearchMessage = async (content) => {
  if (isStreaming.value) {
    console.warn('⚠️ 已有消息在流式输出中，忽略重复请求')
    return
  }
  
  isStreaming.value = true

  try {
    // 添加用户搜索消息
    const userMessageId = store.addMessage(store.currentSession, true, `🔍 搜索: ${content}`)
    
    // 添加空的AI消息用于流式更新
    const aiMessageId = store.addMessage(store.currentSession, false, '')
    streamingMessageId.value = aiMessageId

    store.setLoading(true)
    
    // 调用搜索API
    const response = await api.search(store.currentSession, content)
    
    if (!response.data || !response.data.reply) {
      throw new Error('搜索API返回数据格式错误')
    }
    
    // 提取实际的Markdown内容
    const searchResult = extractActualReply(response.data.reply)
    
    if (!searchResult || searchResult.trim() === '') {
      throw new Error('搜索结果为空')
    }
    
    // 开始前端流式输出
    await simulateStreaming(searchResult, aiMessageId, 15)
    
  } catch (err) {
    console.error('❌ 搜索失败:', err)
    const errorMsg = err.response?.data?.error || err.message || '搜索失败'
    store.setError(errorMsg)
    
    if (streamingMessageId.value) {
      store.updateMessageContent(store.currentSession, streamingMessageId.value, `❌ 搜索错误: ${errorMsg}`)
    }
  } finally {
    store.setLoading(false)
    stopStreaming()
  }
}

// 其他方法保持不变
const handleSelectSession = async (sessionId) => {
  store.setCurrentSession(sessionId)
}

const handleDeleteSession = async (sessionId) => {
  try {
    store.removeSession(sessionId)
  } catch (err) {
    console.error('❌ 删除会话失败:', err)
    store.setError('删除会话失败')
  }
}

const handleCreateSession = (sessionId) => {
  store.addSession(sessionId)
}

const handleClearHistory = async () => {
  if (confirm(`确定要清空当前会话 "${store.currentSession}" 的历史记录吗？`)) {
    try {
      store.clearSessionMessages(store.currentSession)
    } catch (err) {
      console.error('❌ 清空历史记录失败:', err)
      store.setError('清空历史记录失败')
    }
  }
}

const handleExportChat = () => {
  exportData.value = store.exportChatData()
  showExportDialog.value = true
}

const handleImportChat = () => {
  if (importData.value.trim()) {
    const success = store.importChatData(importData.value)
    if (success) {
      alert('聊天记录导入成功！')
      showImportDialog.value = false
      importData.value = ''
    } else {
      alert('聊天记录导入失败，请检查数据格式！')
    }
  } else {
    alert('请输入要导入的聊天数据！')
  }
}

const copyExportData = async () => {
  try {
    await navigator.clipboard.writeText(exportData.value)
    alert('已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = exportData.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('已复制到剪贴板！')
  }
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    store.clearApiKey()
    router.push('/login')
  }
}

// 组件挂载和卸载
onMounted(() => {
  console.log('🚀 Chat组件已挂载')
})

onUnmounted(() => {
  stopStreaming()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg);
  border-right: 1px solid var(--border-color);
  height: 100%;
  overflow: hidden;
}

.app-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  color: white;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.app-version {
  font-size: 0.75rem;
  opacity: 0.8;
  text-align: center;
  margin-top: 0.25rem;
}

.user-info {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  background: var(--card-bg);
}

.storage-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-color);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.storage-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.storage-stats span {
  display: flex;
  justify-content: space-between;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title h1 {
  color: var(--primary-color);
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.chat-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-badge {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.session-name {
  font-weight: 600;
  color: var(--text-primary);
}

.messages-container {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

.empty-state {
  margin: auto;
  color: var(--text-secondary);
  font-size: 1.25rem;
  text-align: center;
  padding: 2rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem auto;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem 1rem;
  margin: 1rem;
  border-radius: var(--radius);
  border: 1px solid #fcc;
}

.danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
}

.danger:hover {
  background-color: #c82333;
}

.secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
}

.secondary:hover {
  background-color: #5a6268;
}

.primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
}

.primary:hover {
  background-color: var(--primary-dark);
}

/* 对话框样式 */
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
  max-width: 500px;
  margin: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.dialog h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--text-primary);
  text-align: center;
}

.dialog textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-family: monospace;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
}

.dialog textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: 100vh;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .chat-area {
    flex: 1;
    min-height: 60vh;
  }
  
  .chat-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .session-info {
    align-self: flex-end;
  }
  
  .storage-stats {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
[file content end]
