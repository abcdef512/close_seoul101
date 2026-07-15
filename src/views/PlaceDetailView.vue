<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import MapView from '../components/MapView.vue'
import { fetchPlace, fetchCategoryIndex } from '../utils/places'
import { colorFor } from '../utils/categoryTheme'

const route = useRoute()
const place = ref(null)
const label = ref('')
const loading = ref(true)
const notFound = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    const [p, categories] = await Promise.all([
      fetchPlace(route.params.category, route.params.id),
      fetchCategoryIndex(),
    ])
    if (!p) {
      notFound.value = true
    } else {
      place.value = p
      label.value = categories.find((c) => c.key === route.params.category)?.label || ''
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => [route.params.category, route.params.id], load)
</script>

<template>
  <section class="container detail">
    <RouterLink to="/" class="back">← 지도·정보로 돌아가기</RouterLink>

    <p v-if="loading" class="hint">불러오는 중…</p>
    <p v-else-if="notFound" class="hint">해당 장소 정보를 찾을 수 없습니다.</p>

    <template v-else-if="place">
      <span class="badge" :style="{ background: colorFor(place.category) + '22', color: colorFor(place.category) }">
        {{ label }}
      </span>
      <h1>{{ place.title }}</h1>

      <div class="layout">
        <div class="media card">
          <img v-if="place.image" :src="place.image" :alt="place.title" />
          <div v-else class="no-image">이미지 정보 없음</div>
        </div>

        <div class="info card">
          <dl>
            <dt>주소</dt>
            <dd>{{ place.addr || '정보 없음' }}{{ place.addrDetail ? ` (${place.addrDetail})` : '' }}</dd>
            <dt>전화</dt>
            <dd>{{ place.tel || '정보 없음' }}</dd>
          </dl>
        </div>
      </div>

      <div v-if="place.lat && place.lng" class="map-panel card">
        <MapView :places="[place]" :category-colors="{ [place.category]: colorFor(place.category) }" />
      </div>

      <p class="source">
        출처: 한국관광공사 Tour API(TourAPI 4.0) · 공공누리 제3유형(출처표시+변경금지) ·
        <a href="https://www.data.go.kr/data/15101578/openapi.do" target="_blank" rel="noopener">원본 데이터 보기</a>
      </p>
    </template>
  </section>
</template>

<style scoped>
.detail {
  padding: 32px 20px 60px;
  max-width: 720px;
}

.back {
  display: inline-block;
  margin-bottom: 18px;
  font-weight: 600;
  color: var(--ink-soft);
}

h1 {
  font-size: 26px;
  margin: 10px 0 20px;
}

.layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.media {
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--ink-soft);
  background: var(--line);
}

.info {
  padding: 16px;
}

dl {
  margin: 0;
}

dt {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-top: 12px;
}

dt:first-child {
  margin-top: 0;
}

dd {
  margin: 4px 0 0;
  font-size: 14.5px;
}

.map-panel {
  height: 280px;
  padding: 6px;
  margin-bottom: 20px;
}

.source {
  font-size: 12.5px;
  color: var(--ink-soft);
}

.source a {
  color: var(--celadon);
  font-weight: 600;
}

.hint {
  color: var(--ink-soft);
  padding: 40px 0;
}

@media (max-width: 640px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
