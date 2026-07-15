<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MapView from '../components/MapView.vue'
import PlaceCard from '../components/PlaceCard.vue'
import { fetchCategoryIndex, fetchCategory } from '../utils/places'
import { CATEGORY_COLORS, colorFor } from '../utils/categoryTheme'

// 기본 노출 카테고리: RFP 필수 항목(관광지/문화시설/축제) 우선, 나머지는 필터로 선택
const DEFAULT_ACTIVE = ['attractions', 'culture', 'festivals']

const categories = ref([])
const activeKeys = ref([...DEFAULT_ACTIVE])
const placesByCategory = ref({})
const loading = ref(true)
const query = ref('')
const error = ref('')

async function loadCategory(key) {
  if (placesByCategory.value[key]) return
  const data = await fetchCategory(key)
  placesByCategory.value = { ...placesByCategory.value, [key]: data.items }
}

async function toggleCategory(key) {
  if (activeKeys.value.includes(key)) {
    activeKeys.value = activeKeys.value.filter((k) => k !== key)
  } else {
    activeKeys.value = [...activeKeys.value, key]
    await loadCategory(key)
  }
}

const visiblePlaces = computed(() => {
  const all = activeKeys.value.flatMap((k) => placesByCategory.value[k] || [])
  if (!query.value.trim()) return all
  const q = query.value.trim().toLowerCase()
  return all.filter((p) => p.title.toLowerCase().includes(q) || p.addr.toLowerCase().includes(q))
})

onMounted(async () => {
  try {
    categories.value = await fetchCategoryIndex()
    await Promise.all(DEFAULT_ACTIVE.map(loadCategory))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <p class="eyebrow">서울 · 공공데이터 기반 지역정보</p>
      <h1>가까운 서울을, 지도 위에서 먼저 만나보세요</h1>
      <p class="sub">
        한국관광공사 Tour API 데이터를 바탕으로 관광지·문화시설·축제 정보를 한 화면에서
        살펴보고, 동네게시판에서 다른 방문자와 정보를 나눠보세요.
      </p>
      <div class="search">
        <input
          v-model="query"
          type="search"
          placeholder="장소명이나 주소로 검색 (예: 경복궁, 한강)"
          aria-label="장소 검색"
        />
      </div>
    </div>
  </section>

  <section class="container">
    <div class="filters" role="group" aria-label="카테고리 필터">
      <button
        v-for="c in categories"
        :key="c.key"
        class="chip"
        :class="{ active: activeKeys.includes(c.key) }"
        :style="{ '--chip-color': colorFor(c.key) }"
        @click="toggleCategory(c.key)"
      >
        <span class="dot" :style="{ background: colorFor(c.key) }"></span>
        {{ c.icon }} {{ c.label }}
        <span class="count">{{ c.total }}</span>
      </button>
    </div>

    <p v-if="error" class="error-box">{{ error }}</p>

    <div class="map-panel card">
      <MapView :places="visiblePlaces" :category-colors="CATEGORY_COLORS" />
    </div>

    <h2 class="list-title">
      목록 <span class="list-count">({{ visiblePlaces.length.toLocaleString() }}건)</span>
    </h2>

    <p v-if="loading" class="hint">불러오는 중…</p>
    <p v-else-if="!visiblePlaces.length" class="hint">
      선택한 조건에 맞는 장소가 없습니다. 카테고리를 더 선택하거나 검색어를 지워보세요.
    </p>
    <div v-else class="grid">
      <PlaceCard
        v-for="p in visiblePlaces.slice(0, 60)"
        :key="`${p.category}-${p.id}`"
        :place="p"
        :icon="categories.find((c) => c.key === p.category)?.icon"
      />
    </div>
    <p v-if="visiblePlaces.length > 60" class="hint">
      상위 60건만 표시했습니다. 검색어로 더 좁혀보세요.
    </p>
  </section>
</template>

<style scoped>
.hero {
  background: var(--ink);
  color: var(--paper);
  padding: 56px 0 40px;
}

.hero-inner {
  max-width: 720px;
}

.eyebrow {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ochre);
  margin-bottom: 10px;
}

.hero h1 {
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1.25;
  margin-bottom: 14px;
}

.sub {
  color: #cfcabc;
  line-height: 1.6;
  margin-bottom: 24px;
}

.search input {
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--radius-s);
  border: none;
  font-size: 15px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 24px 0 16px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid var(--line);
  background: var(--paper-raised);
  border-radius: 999px;
  padding: 7px 12px 7px 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-soft);
}

.chip .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.35;
}

.chip.active {
  border-color: var(--chip-color);
  color: var(--ink);
  background: color-mix(in srgb, var(--chip-color) 10%, white);
}

.chip.active .dot {
  opacity: 1;
}

.count {
  color: var(--ink-soft);
  font-weight: 500;
  font-size: 12px;
}

.error-box {
  color: var(--dancheong-red);
  font-weight: 600;
}

.map-panel {
  height: 420px;
  padding: 6px;
  margin-bottom: 28px;
}

.list-title {
  font-size: 19px;
  margin-bottom: 14px;
}

.list-count {
  font-weight: 400;
  color: var(--ink-soft);
  font-size: 14px;
}

.hint {
  color: var(--ink-soft);
  padding: 20px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
  padding-bottom: 40px;
}

@media (max-width: 640px) {
  .map-panel {
    height: 320px;
  }
}
</style>
