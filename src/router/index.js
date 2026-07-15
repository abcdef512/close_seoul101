import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardListView from '../views/BoardListView.vue'
import BoardDetailView from '../views/BoardDetailView.vue'
import BoardFormView from '../views/BoardFormView.vue'
import PlaceDetailView from '../views/PlaceDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/place/:category/:id', name: 'place-detail', component: PlaceDetailView, props: true },
    { path: '/board', name: 'board-list', component: BoardListView },
    { path: '/board/new', name: 'board-new', component: BoardFormView },
    { path: '/board/:id/edit', name: 'board-edit', component: BoardFormView, props: true },
    { path: '/board/:id', name: 'board-detail', component: BoardDetailView, props: true },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
