<template>
  <v-app>
    <!-- 앱바 -->
    <AppBar @openLogin="openLoginModal" />

    <!-- 메인 컨텐츠 -->
    <v-main>
      <!-- 로그인 모달 -->
      <v-dialog 
        v-model="isLoginModalOpen" 
        persistent 
        max-width="400" 
        overlay-opacity="0.8"
      >
        <AppLogin @close="closeLoginModal" />
      </v-dialog>

      <!-- 라우터 뷰 -->
      <router-view></router-view>
      <router-link to="/search" class="nav-link">1. 코스 검색 기능 (Search) CourseSearch.vue</router-link>
  <router-link to="/detail" class="nav-link">2. 코스 상세 조회 기능 (Course Detail) CourseDetail.vue</router-link>
  <router-link to="/nearby" class="nav-link">3. 위치 기반 가까운 코스 추천 (Nearby Courses) NearbyCourse.vue</router-link>
  <router-link to="/filter" class="nav-link">4. 코스 필터링 기능 (Filter Courses) FilterCourse.vue</router-link>
  <router-link to="/favorites" class="nav-link">5. 코스 즐겨찾기 기능 (Favorites) FavoriteCourse.vue</router-link>
  <router-link to="/recommend" class="nav-link">6. 코스 추천 기능 (Course Recommendation) CourseRecommend.vue</router-link>

      <!-- 스낵바 -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        location="top"
      >
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn variant="text" @click="snackbar.show = false">닫기</v-btn>
        </template>
      </v-snackbar>
    </v-main>

    <!-- 푸터 -->
    <AppFooter />
  </v-app>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMemberStore } from '@/store/member';
import { TOKEN_TYPE } from '@/util/auth';  // TOKEN_TYPE import 추가
import AppBar from './components/AppBar.vue';
import AppLogin from './components/login/AppLogin.vue';
import AppFooter from './components/AppFooter.vue';


const router = useRouter();
const memberStore = useMemberStore();

// 로그인 모달 상태
const isLoginModalOpen = ref(false);

// 스낵바 상태
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
});

// 자동 로그인 처리
onMounted(async () => {
  try {
    const accessToken = sessionStorage.getItem(TOKEN_TYPE.ACCESS);
    if (accessToken) {
      const isValid = await memberStore.checkLoginState();
      if (isValid) {
        showSnackbar({
          text: '자동 로그인되었습니다.',
          color: 'success'
        });
      }
    }
  } catch (error) {
    console.error('자동 로그인 실패:', error);
    showSnackbar({
      text: '자동 로그인에 실패했습니다.',
      color: 'error'
    });
  }
});
// 메서드
const openLoginModal = () => {
  isLoginModalOpen.value = true;
};

const closeLoginModal = () => {
  isLoginModalOpen.value = false;
};

// 스낵바 표시 함수
const showSnackbar = ({ text, color = 'success', timeout = 3000 }) => {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout,
  };
};

// provide를 사용하여 하위 컴포넌트에서 스낵바 사용 가능하게 함
provide('showSnackbar', showSnackbar);

// 라우트 변경 시 로그인 모달 닫기
router.afterEach(() => {
  isLoginModalOpen.value = false;
});
</script>

<style scoped>
/* 필요한 경우 여기에 스타일 추가 */
.v-application {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.v-main {
  flex-grow: 1;
}
.nav-link {
  display: block;
  padding: 10px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
</style>