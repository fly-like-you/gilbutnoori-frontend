import { createRouter, createWebHistory } from "vue-router";
import { getToken, TOKEN_TYPE } from "@/util/auth";
import HomePage from "../views/HomePage.vue";
import RouteDetail from "@/components/route/RouteDetail.vue";
import CourseDetail from "@/components/course/CourseDetail.vue";
import AttractionMap from "@/components/attraction/AttractionMap.vue";
import TravelPlanner from "@/components/travel/TravelPlanner.vue";
import TravelPlanPlanner from "@/components/travel/plan/TravelPlanPlanner.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/courses/:id",
    name: "CourseDetail",
    component: CourseDetail,
  },

  {
    path: "/attraction",
    name: "AttractionMap",
    component: AttractionMap,
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
    path: "/routes/detail/:id",
    name: "RouteDetail",
    component: RouteDetail,
  },

  {
    path: "/board",
    name: "BoardList",
    component: () => import("../components/board/BoardList.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/board/write",
    name: "article-write",
    component: () => import("../components/board/BoardWrite.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/board/:id",
    name: "article-detail",
    component: () => import("../components/board/BoardDetail.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/board/modify/:id",
    name: "BoardModify",
    component: () => import("../components/board/BoardModify.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/travel",
    name: "TravelPlanner",
    component: TravelPlanner,
  },
  {
    path: "/travel/plan/:id",
    name: "TravelPlanPlanner",
    component: TravelPlanPlanner,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = getToken(TOKEN_TYPE.ACCESS);

  if (requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
