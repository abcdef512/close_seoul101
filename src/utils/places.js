// 서울 지역정보 데이터 로더
// 원본: 한국관광공사 Tour API 4.0 (공공누리 제3유형: 출처표시 + 변경금지)
// public/data/*.json 은 scripts/prepare_data.py 로 원본을 슬림화한 "뷰"이며
// 원본 필드 값 자체는 변경하지 않았다.

const cache = new Map()

export async function fetchCategoryIndex() {
  const res = await fetch('/data/categories.json')
  if (!res.ok) throw new Error('카테고리 목록을 불러오지 못했습니다.')
  return res.json()
}

export async function fetchCategory(key) {
  if (cache.has(key)) return cache.get(key)
  const res = await fetch(`/data/${key}.json`)
  if (!res.ok) throw new Error(`${key} 데이터를 불러오지 못했습니다.`)
  const data = await res.json()
  cache.set(key, data)
  return data
}

export async function fetchPlace(category, id) {
  const data = await fetchCategory(category)
  return data.items.find((it) => it.id === id) || null
}

// 여러 카테고리를 한번에 불러와 지도/검색에 쓸 평탄화된 목록으로 합친다.
export async function fetchPlaces(categories) {
  const results = await Promise.all(categories.map(fetchCategory))
  return results.flatMap((d) => d.items)
}
