<script setup>
import { RouterLink, RouterView } from 'vue-router'
import ChatbotWidget from './components/ChatbotWidget.vue'
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-mark">局</span>
        <span class="logo-text">LocalHub <em>서울</em></span>
      </RouterLink>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">지도·정보</RouterLink>
        <RouterLink to="/board" class="nav-link">동네게시판</RouterLink>
      </nav>
    </div>
  </header>

  <main class="site-main">
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>
        본 서비스는 한국관광공사 Tour API(TourAPI 4.0) 데이터를 활용하였습니다.
        출처: 한국관광공사 · 공공누리 제3유형(출처표시+변경금지)
      </p>
      <p class="footer-note">
        동네게시판 게시글은 이 브라우저·이 기기에만 저장됩니다. 다른 기기에서는 보이지 않아요.
      </p>
    </div>
  </footer>

  <ChatbotWidget />
</template>

<style scoped>
.site-header {
  border-bottom: 1.5px solid var(--line);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  background: var(--dancheong-red);
  color: #fff;
  border-radius: 6px;
  font-size: 15px;
}

.logo-text em {
  font-style: normal;
  color: var(--dancheong-red);
}

.nav {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 14px;
  border-radius: var(--radius-s);
  font-weight: 600;
  font-size: 14px;
  color: var(--ink-soft);
}

.nav-link:hover {
  background: var(--line);
  color: var(--ink);
}

.nav-link.router-link-exact-active {
  background: var(--ink);
  color: var(--paper);
}

.site-main {
  flex: 1;
}

.site-footer {
  border-top: 1.5px solid var(--line);
  background: var(--paper-raised);
  margin-top: 40px;
}

.footer-inner {
  padding: 20px;
  font-size: 12.5px;
  color: var(--ink-soft);
  line-height: 1.6;
}

.footer-note {
  margin-top: 4px;
}
</style>
