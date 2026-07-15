// 챗봇 컨텍스트 빌더
// 전체 JSON을 매 요청마다 프롬프트에 통째로 넣는 대신, 질문과 겹치는 키워드가 있는
// 항목만 골라 짧은 컨텍스트로 만들어 OpenAI API에 함께 보낸다 (토큰 비용/속도 절약).

import { fetchCategory } from './places'
import { listPosts } from './board'

const SEARCHABLE_CATEGORIES = ['attractions', 'culture', 'festivals', 'leisure', 'shopping', 'lodging']

function scoreMatch(text, terms) {
  const lower = text.toLowerCase()
  return terms.reduce((acc, t) => (lower.includes(t) ? acc + 1 : acc), 0)
}

export async function buildContext(question, { maxPlaces = 6, maxPosts = 3 } = {}) {
  const terms = question
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)

  if (!terms.length) return { places: [], posts: [] }

  const categoryData = await Promise.all(SEARCHABLE_CATEGORIES.map(fetchCategory))
  const allPlaces = categoryData.flatMap((d) => d.items)

  const scoredPlaces = allPlaces
    .map((p) => ({ place: p, score: scoreMatch(`${p.title} ${p.addr}`, terms) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPlaces)
    .map((s) => s.place)

  const allPosts = listPosts({})
  const scoredPosts = allPosts
    .map((p) => ({ post: p, score: scoreMatch(`${p.title} ${p.content}`, terms) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPosts)
    .map((s) => s.post)

  return { places: scoredPlaces, posts: scoredPosts }
}

export function formatContextForPrompt({ places, posts }) {
  const placeLines = places.map(
    (p) => `- [${p.category}] ${p.title} / 주소: ${p.addr || '정보없음'} / 전화: ${p.tel || '정보없음'}`
  )
  const postLines = posts.map((p) => `- (게시판) ${p.title}: ${p.content.slice(0, 80)}`)

  if (!placeLines.length && !postLines.length) {
    return '(관련된 장소/게시글 정보를 찾지 못했습니다. 일반적인 안내로 답하고, 확실치 않으면 모른다고 답하세요.)'
  }

  return [...placeLines, ...postLines].join('\n')
}
