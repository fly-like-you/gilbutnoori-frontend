<script setup>
/* eslint-disable no-unused-vars */
import { ref, onMounted, watch } from "vue";
import { listRoutes } from "@/api/route";
import router from "@/router";

// 상태 관리
const routes = ref([]);
const selectedRoute = ref(null);
const showCourses = ref(false);

// 페이지네이션 관련 상태 관리
const currentPage = ref(1);
const totalPages = ref(0);
const totalElements = ref(0);
const pageSize = 20;
const courses = ref([]);
const loadingCourses = ref(false);

// API 요청 함수
const fetchRoutes = async () => {
  listRoutes(
    (response) => {
      if (response.data.isSuccess) {
        routes.value = response.data.result.routes;
      }
    },
    (error) => {
      console.error("Error fetching routes:", error);
    }
  );
};

// 유틸리티 함수들
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ko-KR");
};

const getRouteImage = (routeId) => {
  // 실제 이미지 URL을 반환하는 로직으로 수정 필요
  return `https://picsum.photos/200/300?random=${routeId}`;
};

const selectRoute = (route) => {
  selectedRoute.value = route;
  console.log(route);
  router.push({
    name: "RouteDetail",
    params: { id: route.id },
  });
  // 필요한 경우 라우터를 통한 상세 페이지 이동 로직 추가
};

// 코스 목록 가져오기
// 코스 목록 가져오기 함수 수정
const fetchCourses = async (page = 1) => {
  try {
    loadingCourses.value = true;
    const response = await fetch(
      `http://localhost:8080/courses/search?routeId=${selectedRoute.value.id}&size=${pageSize}&page=${page - 1}`
    );

    if (!response.ok) {
      throw new Error("코스 데이터를 불러오는데 실패했습니다.");
    }

    const data = await response.json();

    if (data.isSuccess) {
      courses.value = data.result.courses;
      totalPages.value = data.result.totalPages;
      totalElements.value = data.result.totalElements;
    } else {
      throw new Error(data.message || "데이터 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error("코스 API 요청 오류:", error);
    error.value = error.message;
  } finally {
    loadingCourses.value = false;
  }
};

// 시간 포맷팅
const formatTime = (minutes) => {
  if (!minutes) return "정보 없음";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};
// 이미지 생성
const getRandomImage = (id) => {
  return `https://picsum.photos/seed/${id}/500/300`;
};
// 난이도별 색상
const getLevelColor = (level) => {
  const colors = {
    1: "success",
    2: "info",
    3: "warning",
    4: "error",
  };
  return colors[level] || "grey";
};
// 페이지 변경 핸들러
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchCourses(page);
};

// currentPage 변경 감지
watch(currentPage, (newPage) => {
  fetchCourses(newPage);
});

// 둘레길 선택시 코스 목록 초기화
const viewCourseDetail = (route) => {
  selectedRoute.value = route;
  showCourses.value = true;
  currentPage.value = 1; // 페이지 초기화
  fetchCourses(1); // 첫 페이지 데이터 로드
};

onMounted(() => {
  fetchRoutes();
});
</script>

<template>
  <div>
    <v-container class="py-8">
      <v-row>
        <v-col cols="12" class="mb-4">
          <h3 class="text-h5 font-weight-bold">국내 도보여행길 목록</h3>
        </v-col>
      </v-row>
      <v-slide-group v-model="selectedRoute" class="pa-4" selected-class="bg-primary" show-arrows>
        <v-slide-group-item v-for="route in routes" :key="route.id">
          <v-card class="ma-4" width="300" @click.stop="selectRoute(route)">
            <v-img :src="getRouteImage(route.id)" height="200" cover></v-img>
            <v-card-title>{{ route.name }}</v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" class="mr-1">mdi-map-marker-path</v-icon>
                <span class="text-body-2">도보여행</span>
                <v-icon size="small" class="ml-4 mr-1">mdi-calendar</v-icon>
                <span class="text-body-2">{{ formatDate(route.createdAt) }}</span>
              </div>
              <div class="text-body-2 text-grey">{{ route.summary }}</div>
            </v-card-text>
            <v-btn color="primary" variant="text" @click.stop="viewCourseDetail(route)"> 관련 코스 둘러보기 </v-btn>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>

      <!-- 선택된 둘레길의 코스 리스트 -->
      <v-dialog v-model="showCourses" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="showCourses = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ selectedRoute?.name }} 코스 목록</v-toolbar-title>
          </v-toolbar>

          <v-container>
            <!-- 코스 로딩 상태 -->
            <div v-if="loadingCourses" class="d-flex justify-center my-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <!-- 코스 목록 -->
            <v-row v-else-if="courses.length > 0">
              <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" lg="4">
                <v-card class="h-100" hover>
                  <v-img height="200" :src="getRandomImage(course.id)" class="bg-grey-lighten-2" cover>
                    <v-chip
                      class="ma-2"
                      :color="getLevelColor(course.level)"
                      variant="elevated"
                      label
                      text-color="white"
                    >
                      난이도 {{ course.level }}
                    </v-chip>
                  </v-img>

                  <v-card-title class="text-h6">
                    {{ course.name }}
                  </v-card-title>

                  <v-card-text>
                    <div class="d-flex flex-wrap gap-2 mb-4">
                      <v-chip size="small" color="primary" label> {{ course.dist }}km </v-chip>
                      <v-chip size="small" color="secondary" label>
                        {{ formatTime(course.turnaround) }}
                      </v-chip>
                    </div>

                    <p class="mb-4" v-html="course.summary"></p>

                    <div class="d-flex align-center">
                      <v-icon size="small" color="primary" class="me-1"> mdi-map-marker </v-icon>
                      <span class="text-body-2">{{ course.sigun }}</span>
                    </div>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click.stop="viewCourseDetail(course.id)"> 상세 보기 </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <!-- 코스가 없을 경우 -->
            <v-alert v-else type="info" class="mt-4"> 현재 등록된 코스가 없습니다. </v-alert>

            <!-- 수정된 페이지네이션 부분 -->
            <div class="d-flex justify-center mt-6">
              <v-pagination
                v-if="totalPages > 1"
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                @update:model-value="handlePageChange"
                class="my-4"
              ></v-pagination>
            </div>
          </v-container>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.course-type-carousel {
  background-color: #f5f5f5;
}

.course-type-carousel :deep(.v-carousel__controls) {
  display: none;
}

.v-slide-group {
  background-color: transparent;
}
</style>
