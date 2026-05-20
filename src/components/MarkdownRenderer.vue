<template>
  <div class="markdown-container">
    <div class="markdown-content" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
});

// 配置 marked 选项
marked.setOptions({
  breaks: true,    // 将换行符转换为 <br>
  gfm: true,       // 启用 GitHub Flavored Markdown
  headerIds: true, // 为标题添加 id 属性
});

const renderedContent = computed(() => {
  // 如果内容为空，返回空段落
  if (!props.content || props.content.trim() === '') {
    return '<p></p>';
  }

  try {
    // 使用 marked 将 Markdown 转换为 HTML
    const html = marked(props.content);
    return html;
  } catch (error) {
    console.error('Markdown 渲染错误:', error);
    // 如果渲染失败，返回原始内容
    return `<pre>${props.content}</pre>`;
  }
});
</script>

<style scoped>
.markdown-container {
  border: 2px solid #f0f0f0;
  border-radius: var(--radius);
  background: white;
  overflow: hidden;
  margin: 0.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.markdown-content {
  line-height: 1.7;
  text-align: left;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
}

/* 使用 :deep() 选择器来样式化 Markdown 内容 */
.markdown-content :deep(h1) {
  font-size: 18px;
  color: #1e293b;
  margin: 1.8em 0 1em 0;
  font-weight: 700;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5em;
}

.markdown-content :deep(h2) {
  font-size: 16px;
  color: #1e293b;
  margin: 1.5em 0 0.8em 0;
  font-weight: 600;
  border-left: 4px solid #3b82f6;
  padding-left: 0.8em;
}

.markdown-content :deep(h3) {
  font-size: 15px;
  color: #374151;
  margin: 1.2em 0 0.6em 0;
  font-weight: 600;
}

.markdown-content :deep(h4) {
  font-size: 14px;
  color: #4b5563;
  margin: 1em 0 0.5em 0;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin: 1em 0;
  color: #4b5563;
  font-size: 14px;
  font-weight: 400;
}

.markdown-content :deep(strong) {
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(transparent 60%, #fef3c7 60%);
  padding: 0 2px;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #6b7280;
}

.markdown-content :deep(ul) {
  margin: 1.2em 0;
  padding-left: 2em;
}

.markdown-content :deep(ol) {
  margin: 1.2em 0;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin: 0.6em 0;
  position: relative;
  font-size: 14px;
}

.markdown-content :deep(ul li)::before {
  content: "•";
  color: #3b82f6;
  font-weight: bold;
  position: absolute;
  left: -1em;
}

/* 删除有序列表的自动编号 */
/* .markdown-content :deep(ol) {
  counter-reset: list-counter;
}

.markdown-content :deep(ol li) {
  counter-increment: list-counter;
}

.markdown-content :deep(ol li)::before {
  content: counter(list-counter) ".";
  color: #3b82f6;
  font-weight: bold;
  position: absolute;
  left: -1.5em;
} */

.markdown-content :deep(blockquote) {
  border-left: 4px solid #10b981;
  padding: 1.2em 1.5em;
  margin: 1.8em 0;
  color: #047857;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 0 var(--radius) var(--radius) 0;
  font-style: italic;
}

.markdown-content :deep(code) {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.25em 0.5em;
  border-radius: var(--radius);
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
  font-size: 0.85em;
  color: #dc2626;
  border: 1px solid #e2e8f0;
  font-weight: 500;
}

.markdown-content :deep(pre) {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 1.5rem;
  border-radius: var(--radius);
  overflow-x: auto;
  margin: 1.8em 0;
  border: 1px solid #475569;
  position: relative;
}

.markdown-content :deep(pre)::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  border-radius: var(--radius) var(--radius) 0 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #e2e8f0;
  border: none;
  font-size: 0.9em;
  line-height: 1.5;
  font-weight: 400;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 2em 0;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius);
  overflow: hidden;
  font-size: 0.9em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 1em 1.2em;
  text-align: left;
  line-height: 1.4;
}

.markdown-content :deep(th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 700;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
}

.markdown-content :deep(tr:nth-child(even)) {
  background-color: #fafafa;
}

.markdown-content :deep(tr:hover) {
  background-color: #f1f5f9;
  transition: background-color 0.2s ease;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
}

.markdown-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 2.5em 0;
}

/* 滚动条样式 */
.markdown-content::-webkit-scrollbar {
  width: 6px;
}

.markdown-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.markdown-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.markdown-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-container {
    margin: 0.25rem 0;
  }
  
  .markdown-content {
    padding: 1rem;
    font-size: 13px;
  }
  
  .markdown-content :deep(h1) {
    font-size: 16px;
    padding: 0.8rem 1rem;
    margin: -1rem -1rem 1rem -1rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 15px;
  }
  
  .markdown-content :deep(h3) {
    font-size: 14px;
  }
  
  .markdown-content :deep(p) {
    font-size: 13px;
  }
  
  .markdown-content :deep(li) {
    font-size: 13px;
  }
}
</style>
