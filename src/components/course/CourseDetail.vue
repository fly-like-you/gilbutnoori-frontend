<template>
  <v-container>
    <!-- 로딩 상태 -->
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- 에러 메시지 -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- 코스 리스트 -->
    <v-row v-else>
      <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" lg="4">
        <v-card class="h-100" hover>
          <!-- 카드 이미지 -->
          <v-img
            height="200"
            :src="getRandomImage(course.id)"
            class="bg-grey-lighten-2"
            cover
          >
            <!-- 난이도 뱃지 -->
            <v-chip
              class="ma-2"
              :color="getLevelColor(course.level)"
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
            <!-- 기본 정보 칩 -->
            <div class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                size="small"
                color="primary"
                label
              >
                {{ course.dist }}km
              </v-chip>
              <v-chip
                size="small"
                color="secondary"
                label
              >
                {{ formatTime(course.turnaround) }}
              </v-chip>
              <v-chip
                size="small"
                label
              >
                {{ course.cycle }}
              </v-chip>
            </div>

            <!-- 코스 요약 -->
            <p class="mb-4" v-html="course.summary"></p>

            <!-- 위치 정보 -->
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="me-1">
                mdi-map-marker
              </v-icon>
              <span class="text-body-2">{{ course.sigun }}</span>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click="viewCourseDetail(course.id)"
            >
              상세 보기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 페이지네이션 -->
    <div class="d-flex justify-center mt-6">
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:model-value="handlePageChange"
      ></v-pagination>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const courses = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const itemsPerPage = 9; // 페이지당 보여줄 항목 수

// 난이도별 색상
const getLevelColor = (level) => {
  const colors = {
    1: 'success',
    2: 'info',
    3: 'warning',
    4: 'error'
  };
  return colors[level] || 'grey';
};

// 시간 포맷팅
const formatTime = (minutes) => {
  if (!minutes) return '정보 없음';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};

// 랜덤 이미지 생성 (실제 구현시에는 실제 이미지로 교체)
const getRandomImage = (id) => {
  return `https://picsum.photos/seed/${id}/500/300`;
};

// 코스 데이터 가져오기
const fetchCourses = async (page = 1) => {
  loading.value = true;
  try {
    const response = await axios.get(`http://localhost:8080/courses`, {
      params: {
        page: page - 1, // 백엔드는 0-based pagination
        size: itemsPerPage,
        sort: 'id,desc'
      }
    });

    if (response.data.isSuccess) {
      courses.value = response.data.result.content;
      totalPages.value = response.data.result.totalPages;
    } else {
      error.value = '데이터를 불러오는데 실패했습니다.';
    }
  } catch (err) {
    error.value = '서버 오류가 발생했습니다.';
    console.error('Error fetching courses:', err);
  } finally {
    loading.value = false;
  }
};

// 페이지 변경 처리
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchCourses(page);
};

// 상세 정보 보기
const viewCourseDetail = (courseId) => {
  router.push(`/courses/${courseId}`);
};

// 초기 데이터 로드
onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}

/* HTML 컨텐츠 스타일링 */
:deep(br) {
  margin-bottom: 0.5rem;
}
</style>