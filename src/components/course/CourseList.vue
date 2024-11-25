<template>
  <v-container>
    <!-- 필터 섹션 -->
    <v-card class="mb-6">
      <v-card-title>둘레길 검색</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.distance"
              :items="distanceOptions"
              label="코스 길이"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.level"
              :items="levelOptions"
              label="난이도"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.cycle"
              :items="cycleOptions"
              label="코스 유형"
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- 에러 메시지 -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- 코스 목록 -->
    <v-row v-else>
      <v-col v-for="course in filteredCourses" :key="course.id" cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          height="100%"
          @click="viewDetail(course.id)"
        >
          <v-img
            :src="getCourseThumbnail(course)"
            height="200px"
            cover
            class="align-end"
          >
            <v-card-title class="text-white bg-black bg-opacity-50">
              {{ course.name }}
            </v-card-title>
          </v-img>

          <v-card-text>
            <div class="d-flex mb-2">
              <v-chip
                class="me-2"
                :color="getLevelColor(course.level)"
                size="small"
                label
              >
                난이도 {{ course.level }}
              </v-chip>
              <v-chip
                class="me-2"
                color="info"
                size="small"
                label
              >
                {{ course.dist }}km
              </v-chip>
              <v-chip
                size="small"
                label
              >
                {{ course.cycle }}
              </v-chip>
            </div>
            <p class="text-truncate">{{ course.summary }}</p>
            <div class="d-flex align-center mt-2">
              <v-icon size="small" class="me-1">mdi-clock-outline</v-icon>
              <span class="text-caption">{{ formatTime(course.turnaround) }}</span>
              <v-icon size="small" class="ms-3 me-1">mdi-map-marker</v-icon>
              <span class="text-caption">{{ course.sigun }}</span>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click.stop="viewMap(course.id)"
            >
              지도 보기
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click.stop="viewDetail(course.id)"
            >
              상세 정보
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { courseApi } from '@/api/courseApi';

const router = useRouter();

// 상태 관리
const courses = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(20);

// 필터 옵션
const distanceOptions = [
  { title: '10km 미만', value: '0-10' },
  { title: '10km-20km', value: '10-20' },
  { title: '20km-30km', value: '20-30' },
  { title: '30km 이상', value: '30+' }
];

const levelOptions = [
  { title: '쉬움 (레벨 1)', value: 1 },
  { title: '보통 (레벨 2)', value: 2 },
  { title: '어려움 (레벨 3)', value: 3 },
  { title: '매우 어려움 (레벨 4)', value: 4 }
];

const cycleOptions = [
  { title: '순환형', value: '순환형' },
  { title: '비순환형', value: '비순환형' }
];

// 필터 상태
const filters = ref({
  distance: null,
  level: null,
  cycle: null
});

// 필터링된 코스 목록
const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    let match = true;
    
    if (filters.value.distance) {
      const [min, max] = filters.value.distance.split('-');
      if (max === '+') {
        match = match && course.dist >= parseInt(min);
      } else {
        match = match && course.dist >= parseInt(min) && course.dist <= parseInt(max);
      }
    }
    
    if (filters.value.level) {
      match = match && course.level === filters.value.level;
    }
    
    if (filters.value.cycle) {
      match = match && course.cycle === filters.value.cycle;
    }
    
    return match;
  });
});

// 난이도에 따른 색상
const getLevelColor = (level) => {
  const colors = {
    1: 'success',
    2: 'info',
    3: 'warning',
    4: 'error'
  };
  return colors[level] || 'grey';
};

// 썸네일 이미지 가져오기 (예시)
const getCourseThumbnail = (course) => {
  // 실제로는 course 데이터에 이미지 URL이 포함되어야 합니다.
  // 임시로 더미 이미지를 반환
  return `https://picsum.photos/seed/${course.id}/500/300`;
};

// 시간 포맷팅
const formatTime = (minutes) => {
  if (!minutes) return '정보 없음';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};

// API 호출
const fetchCourses = async (page = 1) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await courseApi.getCourses({}, page - 1, pageSize.value);
    
    if (response.isSuccess) {
      courses.value = response.result.content;
      totalPages.value = response.result.totalPages;
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
  fetchCourses(page);
};

// 상세 정보 보기
const viewDetail = (courseId) => {
  router.push(`/courses/${courseId}`);
};

// 지도 보기
const viewMap = async (courseId) => {
  try {
    const response = await courseApi.getCourseMap(courseId);
    if (response.isSuccess) {
      // GPX 데이터 처리 로직
      console.log('Map data:', response.result);
    }
  } catch (error) {
    console.error('Error fetching map data:', error);
  }
};

// 초기 데이터 로드
onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>