import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useStore = defineStore('main', () => {
  // 状态 - 从本地存储初始化
  const apiKey = ref(localStorage.getItem('api_key') || '');
  const sessions = ref(JSON.parse(localStorage.getItem('gpt4o_sessions')) || ['default_session']);
  const currentSession = ref(localStorage.getItem('gpt4o_currentSession') || 'default_session');
  
  // 修复：确保消息对象是响应式的
  const messages = ref({});
  
  // 初始化消息 - 修复版本
  const initializeMessages = () => {
    try {
      const stored = localStorage.getItem('gpt4o_messages');
      console.log('💾 从本地存储加载消息:', stored ? '有数据' : '无数据');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 解析后的消息结构:', Object.keys(parsed));
        
        // 确保每个会话的消息都是数组
        Object.keys(parsed).forEach(sessionId => {
          if (!Array.isArray(parsed[sessionId])) {
            console.warn(`⚠️ 会话 ${sessionId} 的消息不是数组，正在修复`);
            parsed[sessionId] = [];
          } else {
            console.log(`✅ 会话 ${sessionId} 有 ${parsed[sessionId].length} 条消息`);
          }
        });
        messages.value = parsed;
      } else {
        console.log('🆕 初始化空消息存储');
        messages.value = {};
      }
    } catch (error) {
      console.error('❌ 初始化消息失败:', error);
      messages.value = {};
    }
  };
  
  // 立即初始化
  initializeMessages();

  const loading = ref(false);
  const error = ref('');

  // 监听状态变化，自动保存到本地存储
  watch(
    sessions,
    (newSessions) => {
      console.log('💾 保存会话列表:', newSessions);
      localStorage.setItem('gpt4o_sessions', JSON.stringify(newSessions));
    },
    { deep: true }
  );

  watch(
    currentSession,
    (newSession) => {
      console.log('💾 保存当前会话:', newSession);
      localStorage.setItem('gpt4o_currentSession', newSession);
    }
  );

  watch(
    messages,
    (newMessages) => {
      try {
        console.log('💾 保存消息到本地存储，会话数量:', Object.keys(newMessages).length);
        localStorage.setItem('gpt4o_messages', JSON.stringify(newMessages));
      } catch (error) {
        console.error('❌ 保存消息失败:', error);
      }
    },
    { deep: true }
  );

  // 计算属性 - 修复版本
  const isAuthenticated = computed(() => !!apiKey.value);
  
  const currentMessages = computed(() => {
    const sessionMessages = messages.value[currentSession.value];
    const result = Array.isArray(sessionMessages) ? sessionMessages : [];
    console.log('🔄 currentMessages 计算属性被调用，返回:', result.length, '条消息');
    return result;
  });

  // 动作
  const setApiKey = (key) => {
    console.log('🔑 设置API Key');
    apiKey.value = key;
    localStorage.setItem('api_key', key);
  };

  const clearApiKey = () => {
    console.log('🧹 清除API Key');
    apiKey.value = '';
    localStorage.removeItem('api_key');
  };

  const addSession = (sessionId) => {
    console.log('🆕 添加会话:', sessionId);
    
    if (!sessions.value.includes(sessionId)) {
      sessions.value.push(sessionId);
    }
    
    // 确保新会话有消息数组
    if (!messages.value[sessionId]) {
      console.log(`📝 为新会话 ${sessionId} 创建消息数组`);
      messages.value = {
        ...messages.value,
        [sessionId]: []
      };
    }
    
    currentSession.value = sessionId;
    return sessionId;
  };

  const removeSession = (sessionId) => {
    console.log('🗑️ 删除会话:', sessionId);
    
    const index = sessions.value.indexOf(sessionId);
    if (index > -1) {
      sessions.value.splice(index, 1);
      
      // 创建新的对象引用以确保响应式更新
      const newMessages = { ...messages.value };
      delete newMessages[sessionId];
      messages.value = newMessages;
    }
    
    if (currentSession.value === sessionId) {
      currentSession.value = sessions.value[0] || 'default_session';
    }
  };

  const setCurrentSession = (sessionId) => {
    console.log('🔄 切换当前会话:', sessionId);
    currentSession.value = sessionId;
  };

  // 修复：完全重写 addMessage 方法
  const addMessage = (sessionId, isUser, content) => {
    console.log(`➕ [STORE] 添加消息到会话 ${sessionId}:`, {
      isUser: isUser ? '用户' : 'AI',
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      现有消息数量: messages.value[sessionId]?.length || 0
    });

    // 确保会话存在且是数组
    if (!messages.value[sessionId]) {
      console.log(`🆕 [STORE] 创建新会话消息数组: ${sessionId}`);
      messages.value = {
        ...messages.value,
        [sessionId]: []
      };
    } else if (!Array.isArray(messages.value[sessionId])) {
      console.log(`🔄 [STORE] 修复会话消息格式: ${sessionId}`);
      messages.value = {
        ...messages.value,
        [sessionId]: []
      };
    }

    // 生成唯一ID和时间戳
    const timestamp = new Date();
    const messageId = `${sessionId}-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage = {
      id: messageId,
      isUser,
      content,
      timestamp: timestamp
    };
    
    console.log(`📝 [STORE] 创建新消息:`, {
      id: messageId,
      isUser,
      contentLength: content.length
    });
    
    // 关键修复：创建全新的数组和对象确保响应式更新
    const currentSessionMessages = messages.value[sessionId] || [];
    const updatedSessionMessages = [...currentSessionMessages, newMessage];
    
    messages.value = {
      ...messages.value,
      [sessionId]: updatedSessionMessages
    };
    
    console.log(`✅ [STORE] 消息添加成功:`, {
      会话: sessionId,
      新消息ID: messageId,
      当前消息数量: updatedSessionMessages.length,
      存储大小: JSON.stringify(messages.value).length + ' bytes'
    });
    
    return messageId;
  };

  // 新增：更新消息内容（用于流式输出）
  const updateMessageContent = (sessionId, messageId, newContent) => {
    console.log(`✏️ [STORE] 更新消息内容:`, {
      会话: sessionId,
      消息ID: messageId,
      新内容长度: newContent.length,
      新内容预览: newContent.substring(0, 50) + (newContent.length > 50 ? '...' : '')
    });

    if (!messages.value[sessionId]) {
      console.warn(`❌ 会话 ${sessionId} 不存在`);
      return false;
    }

    const messageIndex = messages.value[sessionId].findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      console.warn(`❌ 消息 ${messageId} 在会话 ${sessionId} 中未找到`);
      return false;
    }

    // 关键：创建全新的数组和对象确保响应式更新
    const updatedMessages = [...messages.value[sessionId]];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: newContent
    };

    messages.value = {
      ...messages.value,
      [sessionId]: updatedMessages
    };

    console.log(`✅ [STORE] 消息内容更新成功:`, {
      会话: sessionId,
      消息ID: messageId,
      更新后内容长度: newContent.length
    });

    return true;
  };

  const clearSessionMessages = (sessionId) => {
    console.log(`🧹 清空会话消息: ${sessionId}`);
    if (messages.value[sessionId]) {
      messages.value = {
        ...messages.value,
        [sessionId]: []
      };
    }
  };

  const setLoading = (isLoading) => {
    console.log(`🔄 设置加载状态: ${isLoading}`);
    loading.value = isLoading;
  };

  const setError = (errorMessage) => {
    console.log(`❌ 设置错误: ${errorMessage}`);
    error.value = errorMessage;
    if (errorMessage) {
      setTimeout(() => {
        error.value = '';
      }, 5000);
    }
  };

  const loadHistory = (sessionId, history) => {
    console.log(`📥 加载历史记录到会话 ${sessionId}:`, history?.length || 0, '条消息');
    if (history && Array.isArray(history)) {
      messages.value = {
        ...messages.value,
        [sessionId]: history
      };
    }
  };

  // 导出聊天数据
  const exportChatData = () => {
    console.log('💾 导出聊天数据');
    const chatData = {
      sessions: sessions.value,
      currentSession: currentSession.value,
      messages: messages.value,
      exportTime: new Date().toISOString()
    };
    return JSON.stringify(chatData, null, 2);
  };

  // 导入聊天数据
  const importChatData = (chatDataString) => {
    console.log('📤 导入聊天数据');
    try {
      const chatData = JSON.parse(chatDataString);
      if (chatData.sessions) sessions.value = chatData.sessions;
      if (chatData.currentSession) currentSession.value = chatData.currentSession;
      if (chatData.messages) messages.value = chatData.messages;
      return true;
    } catch (error) {
      console.error('导入聊天数据失败:', error);
      return false;
    }
  };

  // 清空所有聊天数据
  const clearAllChatData = () => {
    console.log('🗑️ 清空所有聊天数据');
    sessions.value = ['default_session'];
    currentSession.value = 'default_session';
    messages.value = {};
  };

  // 获取存储统计信息
  const getStorageStats = () => {
    const sessionsCount = sessions.value.length;
    let totalMessages = 0;
    Object.values(messages.value).forEach(msgs => {
      totalMessages += (Array.isArray(msgs) ? msgs.length : 0);
    });
    
    const storageSize = JSON.stringify(messages.value).length;
    const currentSessionMessages = Array.isArray(messages.value[currentSession.value]) 
      ? messages.value[currentSession.value].length 
      : 0;
    
    return {
      sessionsCount,
      totalMessages,
      storageSize: `${(storageSize / 1024).toFixed(2)} KB`,
      currentSession: currentSession.value,
      currentSessionMessages
    };
  };

  // 调试方法：手动检查状态
  const debugState = () => {
    console.group('🔍 Store 状态调试');
    console.log('当前会话:', currentSession.value);
    console.log('会话列表:', sessions.value);
    console.log('消息结构:', Object.keys(messages.value));
    console.log('当前会话消息:', messages.value[currentSession.value]);
    console.log('currentMessages 计算属性:', currentMessages.value);
    console.groupEnd();
  };

  return {
    // 状态
    apiKey,
    sessions,
    currentSession,
    messages,
    loading,
    error,
    
    // 计算属性
    isAuthenticated,
    currentMessages,
    
    // 动作
    setApiKey,
    clearApiKey,
    addSession,
    removeSession,
    setCurrentSession,
    addMessage,
    updateMessageContent, // 新增：用于流式输出
    clearSessionMessages,
    setLoading,
    setError,
    loadHistory,
    exportChatData,
    importChatData,
    clearAllChatData,
    getStorageStats,
    debugState
  };
});
