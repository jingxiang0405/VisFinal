import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        "path": "/",
        "name": "Home",
        "component": () => import('../views/Home.vue'),
        meta : {title: "Homepage"}
    },

  ],
})

router.beforeEach((to, from) => {
    document.title = to.meta?.title ?? 'Vis Final'
});
export default router