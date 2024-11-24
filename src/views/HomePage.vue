<template>
  <v-app>
    <v-container fluid class="homepage pa-0">
      <!-- 히어로 섹션 -->
      <v-container fluid class="hero-section">
        <v-row align="center" justify="space-between" class="mx-auto" style="max-width: 1200px">
          <!-- 텍스트 컨텐츠 -->
          <v-col cols="12" md="6" class="text-content">
            <h1 class="text-h2 font-weight-bold mb-4">새로운 여행 플래너</h1>
            <p class="text-subtitle-1 mb-6 grey--text text--darken-1">전국의 다양한 둘레길을 둘러보세요</p>
            <v-btn size="x-large" color="primary" elevation="2" class="get-started-btn" @click="getStarted">
              <v-icon left>mdi-airplane</v-icon>
              둘레길 여행 시작하기
            </v-btn>
          </v-col>

          <!-- 이미지 섹션 -->
          <v-col cols="12" md="6" class="d-flex justify-center align-center">
            <v-img
              src="../assets/길벗누리.png"
              alt="Travel Planning"
              max-width="100%"
              class="hero-image rounded-lg"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
      <!--캐러셀 섹션-->
      <PostCarousel />

      <!--코스 찾기 캐러셀 섹션-->
      <CourseExplorer></CourseExplorer>

      <!-- 통계 섹션 -->
      <!-- <StatusSection /> -->

      <!-- 특징 섹션 -->
      <!-- <FeaturesSection /> -->
    </v-container>
  </v-app>
</template>

<script>
import PostCarousel from '@/components/board/PostCarousel.vue';
import CourseExplorer from '@/components/course/CourseExplorer.vue';

// import StatusSection from '@/components/home/StatusSection.vue';
// import FeaturesSection from '@/components/home/FeaturesSection.vue';

export default {
  name: 'HomePage',
  components: {
    PostCarousel,
    CourseExplorer,
    // StatusSection,
    // FeaturesSection,
  },
  methods: {
    getStarted() {
      this.$router.push('/travel');
    },
  },
};
</script>

<style scoped>
.homepage {
  overflow-x: hidden;
}

.hero-section {
  padding: 64px 16px;
  background-color: #fff;
}

.text-content {
  padding-right: 32px;
}

.get-started-btn {
  padding: 0 32px;
  height: 48px;
  font-size: 1.1rem;
  text-transform: none;
}

.hero-image {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.hero-image:hover {
  transform: translateY(-10px);
}

@media (max-width: 600px) {
  .text-content {
    padding-right: 0;
    text-align: center;
  }

  .hero-section {
    padding: 32px 16px;
  }
}
</style>
