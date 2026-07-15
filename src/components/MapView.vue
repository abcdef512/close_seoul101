<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  places: { type: Array, default: () => [] },
  categoryColors: { type: Object, default: () => ({}) },
})

const router = useRouter()
const mapEl = ref(null)
let map = null
let markerLayer = null

const SEOUL_CENTER = [37.5665, 126.978]

function makeIcon(color) {
  return L.divIcon({
    className: 'place-pin',
    html: `<span style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  })
}

function renderMarkers() {
  if (!map) return
  markerLayer.clearLayers()

  const withCoords = props.places.filter((p) => p.lat && p.lng)
  withCoords.forEach((place) => {
    const color = props.categoryColors[place.category] || '#b6402b'
    const marker = L.marker([place.lat, place.lng], { icon: makeIcon(color) })
    marker.bindPopup(
      `<strong>${escapeHtml(place.title)}</strong><br/>
       <span class="popup-addr">${escapeHtml(place.addr || '주소 정보 없음')}</span><br/>
       <a href="#" data-id="${place.id}" data-category="${place.category}" class="popup-link">상세 보기</a>`
    )
    marker.on('popupopen', () => {
      const link = document.querySelector(
        `.popup-link[data-id="${place.id}"][data-category="${place.category}"]`
      )
      link?.addEventListener('click', (e) => {
        e.preventDefault()
        router.push({ name: 'place-detail', params: { category: place.category, id: place.id } })
      })
    })
    markerLayer.addLayer(marker)
  })
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

onMounted(() => {
  map = L.map(mapEl.value, { zoomControl: true }).setView(SEOUL_CENTER, 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  renderMarkers()
})

watch(() => props.places, renderMarkers, { deep: false })

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <div ref="mapEl" class="map-root" role="img" aria-label="서울 지역 정보 지도"></div>
</template>

<style>
/* 전역: leaflet div icon은 scoped 스타일이 적용되지 않으므로 전역으로 둔다 */
.place-pin span {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
.popup-addr {
  color: var(--ink-soft);
  font-size: 12.5px;
}
.popup-link {
  display: inline-block;
  margin-top: 6px;
  font-weight: 700;
  color: var(--dancheong-red);
}
</style>

<style scoped>
.map-root {
  width: 100%;
  height: 100%;
  min-height: 360px;
  border-radius: var(--radius-m);
  overflow: hidden;
}
</style>
