<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getPost, createPost, updatePost } from '../utils/board'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => Boolean(route.params.id))

const title = ref('')
const content = ref('')
const author = ref('')
const password = ref('')
const error = ref('')

onMounted(() => {
  if (isEdit.value) {
    const post = getPost(route.params.id)
    if (!post) {
      error.value = '게시글을 찾을 수 없습니다.'
      return
    }
    title.value = post.title
    content.value = post.content
  }
})

function validate() {
  if (!title.value.trim()) return '제목을 입력해주세요.'
  if (!content.value.trim()) return '내용을 입력해주세요.'
  if (!password.value || password.value.length < 4) return '비밀번호를 4자 이상 입력해주세요.'
  return ''
}

function submit() {
  error.value = ''
  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }

  if (isEdit.value) {
    const result = updatePost(route.params.id, {
      title: title.value,
      content: content.value,
      password: password.value,
    })
    if (!result.ok) {
      error.value = result.error
      return
    }
    router.push({ name: 'board-detail', params: { id: route.params.id } })
  } else {
    const post = createPost({
      title: title.value,
      content: content.value,
      author: author.value,
      password: password.value,
    })
    router.push({ name: 'board-detail', params: { id: post.id } })
  }
}
</script>

<template>
  <section class="container form-page">
    <RouterLink :to="isEdit ? { name: 'board-detail', params: { id: route.params.id } } : '/board'" class="back">
      ← 취소하고 돌아가기
    </RouterLink>

    <h1>{{ isEdit ? '게시글 수정' : '새 글 작성' }}</h1>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="title">제목</label>
        <input id="title" v-model="title" type="text" maxlength="80" />
      </div>

      <div v-if="!isEdit" class="field">
        <label for="author">닉네임 (선택, 비우면 '익명')</label>
        <input id="author" v-model="author" type="text" maxlength="20" />
      </div>

      <div class="field">
        <label for="content">내용</label>
        <textarea id="content" v-model="content" rows="8"></textarea>
      </div>

      <div class="field">
        <label for="password">
          {{ isEdit ? '작성 시 등록한 비밀번호' : '비밀번호 (수정·삭제 시 필요, 4자 이상)' }}
        </label>
        <input id="password" v-model="password" type="password" />
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button type="submit" class="btn btn-primary">{{ isEdit ? '수정 완료' : '등록하기' }}</button>
    </form>
  </section>
</template>

<style scoped>
.form-page {
  padding: 32px 20px 60px;
  max-width: 640px;
}

.back {
  display: inline-block;
  margin-bottom: 18px;
  font-weight: 600;
  color: var(--ink-soft);
}

h1 {
  font-size: 22px;
  margin-bottom: 18px;
}

.form {
  padding: 22px;
}

.error-text {
  color: var(--dancheong-red);
  font-size: 13px;
  margin: -6px 0 14px;
}
</style>
