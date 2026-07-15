<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getPost, incrementViewCount, deletePost } from '../utils/board'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const showDeleteForm = ref(false)
const password = ref('')
const error = ref('')

onMounted(() => {
  post.value = incrementViewCount(route.params.id) || getPost(route.params.id)
})

function formatDate(ts) {
  return new Date(ts).toLocaleString('ko-KR')
}

function goEdit() {
  router.push({ name: 'board-edit', params: { id: post.value.id } })
}

function confirmDelete() {
  error.value = ''
  const result = deletePost(post.value.id, password.value)
  if (!result.ok) {
    error.value = result.error
    return
  }
  router.push({ name: 'board-list' })
}
</script>

<template>
  <section class="container detail">
    <RouterLink to="/board" class="back">← 목록으로</RouterLink>

    <template v-if="post">
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <span>{{ post.author }}</span>
        <span>{{ formatDate(post.createdAt) }}</span>
        <span>조회 {{ post.views || 0 }}</span>
      </div>

      <p class="content">{{ post.content }}</p>

      <div class="actions">
        <button class="btn" @click="goEdit">수정</button>
        <button class="btn" @click="showDeleteForm = !showDeleteForm">삭제</button>
      </div>

      <div v-if="showDeleteForm" class="password-box card">
        <div class="field">
          <label for="del-pw">삭제하려면 비밀번호를 입력하세요</label>
          <input id="del-pw" v-model="password" type="password" />
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="btn btn-primary" @click="confirmDelete">삭제 확인</button>
      </div>
    </template>
    <p v-else class="hint">게시글을 찾을 수 없습니다.</p>
  </section>
</template>

<style scoped>
.detail {
  padding: 32px 20px 60px;
  max-width: 680px;
}

.back {
  display: inline-block;
  margin-bottom: 18px;
  font-weight: 600;
  color: var(--ink-soft);
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.meta {
  display: flex;
  gap: 12px;
  font-size: 12.5px;
  color: var(--ink-soft);
  margin-bottom: 20px;
}

.content {
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: 15px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 8px;
}

.password-box {
  margin-top: 16px;
  padding: 16px;
}

.error-text {
  color: var(--dancheong-red);
  font-size: 13px;
  margin: -8px 0 12px;
}

.hint {
  color: var(--ink-soft);
  padding: 40px 0;
}
</style>
