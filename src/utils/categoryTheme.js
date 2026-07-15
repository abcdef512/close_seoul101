// 카테고리별 지도 핀 색상 — 오방색(五方色)에서 절제해 가져온 팔레트
export const CATEGORY_COLORS = {
  attractions: '#b6402b', // 관광지 - 단청 red
  culture: '#3f6b5c', // 문화시설 - celadon
  festivals: '#c58a2e', // 축제공연행사 - ochre
  leisure: '#3b6ea5', // 레포츠 - blue
  shopping: '#8a5a9c', // 쇼핑 - purple
  lodging: '#5c5449', // 숙박 - warm gray
  courses: '#2f855a', // 여행코스 - green
}

export function colorFor(category) {
  return CATEGORY_COLORS[category] || '#b6402b'
}
