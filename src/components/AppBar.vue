// AppBar.vue
<script>
import { ref, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useMemberStore } from "@/store/member";

export default {
  name: "AppBar",
  emits: ["openLogin"],
  setup() {
    const memberStore = useMemberStore();
    const router = useRouter();
    const showSnackbar = inject("showSnackbar");
    const menu = ref(false);

    // 컴포넌트 마운트 시 로그인 상태 체크
    onMounted(() => {
      memberStore.checkLoginState();
    });

    const isAuthenticated = computed(() => memberStore.isLogin);
    const currentUser = computed(() => memberStore.userInfo);

    const handleProtectedRoute = (route) => {
  if (!isAuthenticated.value) {
    showSnackbar({
      text: '로그인이 필요한 서비스입니다.',
      color: 'warning',
    });
    router.push('/login');
  } else {
    // 경로가 '/board'인 경우 name을 사용하여 라우팅
    if (route === '/board') {
      router.push({ name: 'Board' });
    } else {
      router.push(route);
    }
  }
};

    const handleLogout = async () => {
      try {
        await memberStore.userLogout();
        menu.value = false;
        router.push("/");
        showSnackbar({
          text: "로그아웃되었습니다.",
          color: "success",
        });
      } catch (error) {
        console.error("Logout failed:", error);
        showSnackbar({
          text: "로그아웃 중 오류가 발생했습니다.",
          color: "error",
        });
      }
    };

    return {
      menu,
      isAuthenticated,
      currentUser,
      handleLogout,
      handleProtectedRoute,
    };
  },
};
</script>

<template>
  <v-app-bar app fixed flat color="white" elevation="1">
    <v-container class="d-flex align-center">
      <router-link to="/" class="text-decoration-none">
        <v-toolbar-title class="logo">길벗누리</v-toolbar-title>
      </router-link>

      <v-spacer></v-spacer>

      <!-- 메인 네비게이션 -->
      <div class="d-none d-md-flex">
        <v-btn text class="mx-2" @click="() => handleProtectedRoute('/travel')">
          <v-icon left>mdi-airplane</v-icon>
          여행지
        </v-btn>

        <v-btn text class="mx-2" @click="() => handleProtectedRoute('/support')">
          <v-icon left>mdi-help-circle</v-icon>
          고객지원
        </v-btn>

        <v-btn v-if="isAuthenticated" text class="mx-2" to="/plan">
          <v-icon left>mdi-calendar</v-icon>
          여행계획하기
        </v-btn>

        <v-btn text class="mx-2" @click="() => handleProtectedRoute('/board')">
          <v-icon left>mdi-post</v-icon>
          게시판
        </v-btn>
      </div>

      <!-- 비로그인 상태 -->
      <template v-if="!isAuthenticated">
        <v-btn text class="mx-2" @click="$router.push('/signup')">
          <v-icon left>mdi-account-plus</v-icon>
          회원가입
        </v-btn>
        <v-btn text class="mx-2" @click="$emit('openLogin')">
          <v-icon left>mdi-login</v-icon>
          로그인
        </v-btn>
      </template>

      <!-- 로그인 상태 -->
      <template v-else>
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          location="bottom end"
          offset="5"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" size="large">
              <v-avatar color="primary" size="32">
                <v-img
                  src="https://cdn.vuetifyjs.com/images/john.jpg"
                  alt="User"
                ></v-img>
              </v-avatar>
            </v-btn>
          </template>

          <v-list width="200">
            <v-list-item to="/profile" prepend-icon="mdi-account">
              <v-list-item-title>마이페이지</v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
              <v-list-item-title>로그아웃</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: black;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 960px) {
  .logo {
    font-size: 1.25rem;
  }
}
</style>