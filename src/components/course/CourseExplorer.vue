<template>
  <v-container fluid class="pa-0">
    <!-- 상단 코스 타입 캐러셀 -->
    <v-carousel
      v-model="selectedRouteIndex"
      :show-arrows="true"
      hide-delimiter-background
      height="100"
      hide-delimiters
      class="course-type-carousel"
      @update:model-value="handleRouteChange"
    >
      <template v-slot:prev="{ props }">
        <v-btn variant="plain" color="primary" v-bind="props" icon="mdi-chevron-left" size="large"></v-btn>
      </template>
      <template v-slot:next="{ props }">
        <v-btn variant="plain" color="primary" v-bind="props" icon="mdi-chevron-right" size="large"></v-btn>
      </template>

      <v-carousel-item v-for="route in routes" :key="route.id">
        <div class="d-flex justify-center align-center fill-height">
          <h2 class="text-h4 font-weight-bold">{{ route.name }}</h2>
        </div>
      </v-carousel-item>
    </v-carousel>

    <!-- 하단 코스 카드 목록 -->
    <v-container class="py-8">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="d-flex justify-center my-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <!-- 에러 메시지 -->
      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>

      <v-row v-if="!loading && !error">
        <v-col cols="12" class="mb-4">
          <h3 class="text-h5 font-weight-bold">
            {{ currentRoute?.name || "코스 목록" }}
          </h3>
        </v-col>
      </v-row>

      <v-slide-group v-model="selectedCard" class="pa-4" selected-class="bg-primary" show-arrows>
        <v-slide-group-item v-for="course in courses" :key="course.id">
          <v-card class="ma-4" width="300" @click="selectCourse(course)">
            <v-img :src="getRandomImage(course.id)" height="200" cover>
              <v-chip class="ma-2" :color="getLevelColor(course.level)" variant="elevated" label text-color="white">
                난이도 {{ course.level }}
              </v-chip>
            </v-img>

            <v-card-title>{{ course.name }}</v-card-title>

            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                <span class="text-body-2">{{ formatTime(course.turnaround) }}</span>
                <v-icon size="small" class="ml-4 mr-1">mdi-map-marker-distance</v-icon>
                <span class="text-body-2">{{ course.dist }}km</span>
                <v-icon size="small" class="ml-4 mr-1">mdi-walk</v-icon>
                <span class="text-body-2">{{ course.cycle }}</span>
              </div>
              <div class="text-body-2 text-grey" v-html="course.summary"></div>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 라우터 설정
const router = useRouter();

// 상태 관리
const selectedRouteIndex = ref(0);
const selectedCard = ref(null);
const routes = ref([]);
const courses = ref([]);
const loading = ref(false);
const error = ref(null);
const currentRoute = ref(null);

// 둘레길 목록 가져오기
const fetchRoutes = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("http://localhost:8080/routes");
    if (!response.ok) {
      throw new Error("데이터를 불러오는데 실패했습니다.");
    }

    const data = await response.json();

    if (data.isSuccess && data.code === "COMMON200") {
      routes.value = data.result.routes;
      console.log("routes", routes.value);
      if (routes.value.length > 0) {
        currentRoute.value = routes.value[0];
        fetchCourses();
      }
    } else {
      throw new Error(data.message || "데이터 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error("API 요청 오류:", error);
    error.value = error.message;
  } finally {
    loading.value = false;
  }
};

// 코스 목록 가져오기
const fetchCourses = async () => {
  loading.value = true;
  try {
    const queryParams = new URLSearchParams({
      routeId: currentRoute.value.id,
      page: 0,
      size: 20,
      sort: "id,desc",
    });

    const response = await fetch(`http://localhost:8080/courses/search?${queryParams}`);

    if (!response.ok) {
      throw new Error("코스 데이터를 불러오는데 실패했습니다.");
    }

    const data = await response.json();

    if (data.isSuccess) {
      courses.value = data.result.courses;
      console.log(data);
      if (courses.value.length === 0) {
        error.value = `${currentRoute.value.name}에 해당하는 코스가 없습니다.`;
      } else {
        error.value = null;
      }
    } else {
      throw new Error(data.message || "데이터 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error("코스 API 요청 오류:", error);
    error.value = error.message;
  } finally {
    loading.value = false;
  }
};

// 캐러셀 변경 시 호출
const handleRouteChange = (index) => {
  currentRoute.value = routes.value[index];
  fetchCourses();
};

// 코스 선택
const selectCourse = (course) => {
  selectedCard.value = course.id;
  viewCourseDetail(course.id);
};

// 코스 상세 보기
const viewCourseDetail = (courseId) => {
  router.push({
    name: "CourseDetail",
    params: {
      id: courseId,
    },
  });
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

// 이미지 생성 (임시)
const getRandomImage = (id) => {
  return `https://picsum.photos/seed/${id}/500/300`;
};

// 시간 포맷팅
const formatTime = (minutes) => {
  if (!minutes) return "정보 없음";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  fetchRoutes();
});
</script>

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
```
