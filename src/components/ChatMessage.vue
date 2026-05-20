<template>
  <div class="message" :class="{ 'user-message': isUser }">
    <div class="message-avatar">
      <img
        :src="isUser ? userAvatar : botAvatar"
        :alt="isUser ? 'User Avatar' : 'Bot Avatar'"
        class="avatar-img"
      />
    </div>
    <div class="message-content">
      <div v-if="isUser" class="message-text user-text">
        {{ content }}
      </div>
      <MarkdownRenderer v-else :content="content" />
      <div class="message-time">
        {{ formatTime(timestamp) }}
      </div>
    </div>
  </div>
</template>


<script setup>
import { defineProps } from 'vue';
import MarkdownRenderer from './MarkdownRenderer.vue';

// 导入头像图片
import userAvatarImg from '../assets/user.jpg'
import botAvatarImg from '../assets/bot.jpg'


const props = defineProps({
  isUser: Boolean,
  content: String,
  timestamp: Date
});

const userAvatar = userAvatarImg;
const botAvatar = botAvatarImg;

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 2rem;
  gap: 0.75rem;
  max-width: 100%;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar, .bot-avatar {
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bot-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.message-content {
  max-width: 75%;
  min-width: 200px;
}

.user-message .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message:not(.user-message) .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.2rem;
  border-radius: 18px;
  border-bottom-right-radius: 6px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  max-width: 100%;
}

.message-time {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  opacity: 0.7;
  font-weight: 500;
}

.user-message .message-time {
  text-align: right;
  color: #666;
}

.message:not(.user-message) .message-time {
  color: #666;
  text-align: left;
}
</style>
