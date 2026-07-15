// 익명 게시판 CRUD - localStorage 기반
// RFP 요구사항: 회원가입/로그인 없이 게시글 작성, 수정/삭제 시 비밀번호 확인
// 주의: localStorage 특성상 "동일 브라우저 + 동일 기기"에만 저장됨 (UI에 고지 필요)

const STORAGE_KEY = 'localhub_posts_v1'

// 비밀번호는 평문 저장하지 않고 간단한 해시로 저장한다.
// (완전한 암호학적 보안이 아니라, 브라우저 저장소에 평문 노출을 피하기 위한 최소 조치)
function hashPassword(pw) {
  let hash = 0
  for (let i = 0; i < pw.length; i++) {
    hash = (hash << 5) - hash + pw.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('게시글 불러오기 실패', e)
    return []
  }
}

function saveAll(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export function listPosts({ query = '' } = {}) {
  const posts = loadAll().sort((a, b) => b.createdAt - a.createdAt)
  if (!query.trim()) return posts
  const q = query.trim().toLowerCase()
  return posts.filter(
    (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
  )
}

export function getPost(id) {
  return loadAll().find((p) => p.id === id) || null
}

export function incrementViewCount(id) {
  const posts = loadAll()
  const post = posts.find((p) => p.id === id)
  if (post) {
    post.views = (post.views || 0) + 1
    saveAll(posts)
  }
  return post
}

export function createPost({ title, content, author, password }) {
  const posts = loadAll()
  const post = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    content: content.trim(),
    author: author?.trim() || '익명',
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    views: 0,
  }
  posts.push(post)
  saveAll(posts)
  return post
}

export function verifyPassword(id, password) {
  const post = getPost(id)
  if (!post) return false
  return post.passwordHash === hashPassword(password)
}

export function updatePost(id, { title, content, password }) {
  if (!verifyPassword(id, password)) return { ok: false, error: '비밀번호가 일치하지 않습니다.' }
  const posts = loadAll()
  const post = posts.find((p) => p.id === id)
  post.title = title.trim()
  post.content = content.trim()
  post.updatedAt = Date.now()
  saveAll(posts)
  return { ok: true, post }
}

export function deletePost(id, password) {
  if (!verifyPassword(id, password)) return { ok: false, error: '비밀번호가 일치하지 않습니다.' }
  const posts = loadAll().filter((p) => p.id !== id)
  saveAll(posts)
  return { ok: true }
}
