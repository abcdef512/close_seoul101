<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { listPosts } from '../utils/board'

const posts = ref([])
const query = ref('')

function refresh() {
  posts.value = listPosts({ query: query.value })
}

onMounted(refresh)

function formatDate(ts) {
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <section class="container board">
    <div class="board-head">
      <div>
        <h1>동네게시판</h1>
        <p class="sub">로그인 없이 누구나 글을 남길 수 있어요. 이 브라우저에만 저장됩니다.</p>
      </div>
      <RouterLink to="/board/new" class="btn btn-primary">글쓰기</RouterLink>
    </div>

    <input
      v-model="query"
      class="search-input"
      type="search"
      placeholder="제목·내용 검색"
      @input="refresh"
    />

    <p v-if="!posts.length" class="empty">
      아직 게시글이 없습니다. 첫 글을 남겨보세요.
    </p>

    <ul v-else class="post-list">
      <li v-for="p in posts" :key="p.id">
        <RouterLink :to="{ name: 'board-detail', params: { id: p.id } }" class="post-row card">
          <div class="post-main">
            <h3>{{ p.title }}</h3>
            <p class="excerpt">{{ p.content }}</p>
          </div>
          <div class="post-meta">
            <span>{{ p.author }}</span>
            <span>{{ formatDate(p.createdAt) }}</span>
            <span>조회 {{ p.views || 0 }}</span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.board {
  padding: 32px 20px 60px;
  max-width: 760px;
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

h1 {
  font-size: 24px;
}

.sub {
  color: var(--ink-soft);
  font-size: 13.5px;
  margin-top: 6px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-s);
  margin-bottom: 20px;
  font-size: 14.5px;
}

.empty {
  color: var(--ink-soft);
  padding: 40px 0;
  text-align: center;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  transition: border-color 0.12s ease;
}

.post-row:hover {
  border-color: var(--dancheong-red);
}

.post-main h3 {
  font-size: 15.5px;
  margin-bottom: 4px;
}

.excerpt {
  margin: 0;
  font-size: 13px;
  color: var(--ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--ink-soft);
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .post-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .post-meta {
    flex-direction: row;
    gap: 10px;
  }
}
</style>
