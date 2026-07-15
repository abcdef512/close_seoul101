<script setup>
defineProps({
  place: { type: Object, required: true },
  icon: { type: String, default: '📍' },
})
</script>

<template>
  <RouterLink
    :to="{ name: 'place-detail', params: { category: place.category, id: place.id } }"
    class="place-card card"
  >
    <div class="thumb" :class="{ empty: !place.image }">
      <img v-if="place.image" :src="place.image" :alt="place.title" loading="lazy" />
      <span v-else>{{ icon }}</span>
    </div>
    <div class="body">
      <h3>{{ place.title }}</h3>
      <p class="addr">{{ place.addr || '주소 정보 없음' }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.place-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(23, 27, 30, 0.1);
}

.thumb {
  aspect-ratio: 4 / 3;
  background: var(--line);
  display: grid;
  place-items: center;
  font-size: 32px;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  padding: 12px 14px 16px;
}

.body h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.addr {
  font-size: 12.5px;
  color: var(--ink-soft);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
