import { createRouter, createWebHistory } from "vue-router";
import { getToken, TOKEN_TYPE } from "@/util/auth";
import HomePage from "../views/HomePage.vue";
import CourseList from '@/components/course/CourseList.vue';
import CourseDetail from '@/components/course/CourseDetail.vue';

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: CourseDetail
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("../components/login/AppSignUp.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/login/AppLogin.vue"),
  },
  {
    path: "/board",
    name: "Board",
    component: () => import("../components/board/BoardList.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/board/write",
    name: "article-write",
    component: () => import("../components/board/BoardWrite.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/board/:id",
    name: "article-detail",
    component: () => import("../components/board/BoardDetail.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/board/modify/:id",
    name: "article-modify",
    component: () => import("../components/board/BoardModify.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'CourseSearch',
    component: () => import("../components/course/CourseSearch.vue")
  },
  {
    path: '/nearby',
    name: 'NearbyCourse',
    component: () => import("../components/course/NearbyCourse.vue")
  },
  {
    path: '/filter',
    name: 'FilterCourse',
    component: () => import("../components/course/FilterCourse.vue")
  },
  {
    path: '/favorites',
    name: 'FavoriteCourse',
    component: () => import("../components/course/FavoriteCourse.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: '/recommend',
    name: 'CourseRecommend',
    component: () => import("../components/course/CourseRecommend.vue")
  },
  {
    path: '/travel',
    name: 'CourseList',
    component: CourseList,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = getToken(TOKEN_TYPE.ACCESS);

  if (requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;