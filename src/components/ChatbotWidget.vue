<script setup>
import { ref, nextTick } from 'vue'
import { buildContext, formatContextForPrompt } from '../utils/chatContext'

const isOpen = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([
  {
    role: 'assistant',
    content:
      '안녕하세요! 서울 관광지·문화시설·축제·동네게시판 정보를 바탕으로 질문에 답해드려요. 예: "종로 근처 축제 알려줘"',
  },
])
const scrollEl = ref(null)
const configError = !import.meta.env.VITE_OPENAI_API_KEY

async function scrollToBottom() {
  await nextTick()
  scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior: 'smooth' })
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollToBottom()
}

async function send() {
  const question = input.value.trim()
  if (!question || loading.value) return

  messages.value.push({ role: 'user', content: question })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    if (configError) {
      throw new Error(
        '아직 OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 넣어주세요.'
      )
    }

    const context = await buildContext(question)
    const contextText = formatContextForPrompt(context)

    const systemPrompt = `너는 'LocalHub 서울'의 안내 챗봇이야. 아래 [참고 정보]는 서비스에 등록된
실제 장소/게시글 중 이번 질문과 관련 있어 보이는 항목이야. 이 정보를 우선 활용해서 한국어로
친절하고 간결하게 답해. 참고 정보에 없는 내용은 추측하지 말고, 모르면 모른다고 답해.

[참고 정보]
${contextText}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.value.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || `요청 실패 (${res.status})`)
    }

    const data = await res.json()
    const answer = data.choices?.[0]?.message?.content?.trim() || '답변을 생성하지 못했습니다.'
    messages.value.push({ role: 'assistant', content: answer })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `⚠️ ${e.message}` })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <button class="chat-fab" :aria-expanded="isOpen" aria-label="챗봇 열기/닫기" @click="toggle">
    {{ isOpen ? '✕' : '💬' }}
  </button>

  <div v-if="isOpen" class="chat-panel card">
    <div class="chat-header">
      <strong>서울 안내 챗봇</strong>
      <button class="btn-ghost close-btn" aria-label="닫기" @click="toggle">✕</button>
    </div>

    <div ref="scrollEl" class="chat-body">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="msg"
        :class="m.role"
      >
        {{ m.content }}
      </div>
      <div v-if="loading" class="msg assistant loading">답변 작성 중…</div>
    </div>

    <form class="chat-input" @submit.prevent="send">
      <input v-model="input" type="text" placeholder="궁금한 걸 물어보세요" :disabled="loading" />
      <button type="submit" class="btn btn-primary" :disabled="loading">전송</button>
    </form>
  </div>
</template>

<style scoped>
.chat-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: none;
  background: var(--dancheong-red);
  color: #fff;
  font-size: 22px;
  box-shadow: 0 6px 18px rgba(182, 64, 43, 0.4);
  z-index: 50;
}

.chat-panel {
  position: fixed;
  right: 20px;
  bottom: 88px;
  width: 340px;
  max-width: calc(100vw - 32px);
  height: 460px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  z-index: 50;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
}

.close-btn {
  padding: 4px 8px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg {
  max-width: 85%;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.msg.assistant {
  align-self: flex-start;
  background: var(--celadon-dim);
  color: var(--ink);
  border-bottom-left-radius: 2px;
}

.msg.user {
  align-self: flex-end;
  background: var(--ink);
  color: var(--paper);
  border-bottom-right-radius: 2px;
}

.msg.loading {
  opacity: 0.6;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--line);
}

.chat-input input {
  flex: 1;
  padding: 9px 12px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-s);
  font-size: 14px;
}

/* 모바일: 전체 화면 패널로 전환 (RFP III-3-다 요구사항) */
@media (max-width: 640px) {
  .chat-panel {
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
