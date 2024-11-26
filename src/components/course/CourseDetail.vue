<template>
  <v-container>
    <v-progress-circular v-if="!result" indeterminate color="primary" class="ma-auto d-block"></v-progress-circular>

    <template v-else>
      <!-- 코스 기본 정보 섹션 -->
      <v-card class="mb-6">
        <v-card-title class="text-h5 font-weight-bold">
          {{ result.name }}
          <v-chip color="primary" class="ml-2">{{ result.sigun }}</v-chip>
        </v-card-title>
        <v-card-subtitle>{{ result.route.name }} | {{ result.route.summary }}</v-card-subtitle>

        <!-- GPX 파일 출력 -->
        <v-card class="mb-6 mt-6">
          <GpxMap :course-id="result.id" />
        </v-card>
        <!-- 코스 주요 정보 그리드 -->
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-sheet class="pa-3 text-center">
                <div class="text-subtitle-1 font-weight-bold">거리</div>
                <div class="text-h6">{{ result.dist }}km</div>
              </v-sheet>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-sheet class="pa-3 text-center">
                <div class="text-subtitle-1 font-weight-bold">소요시간</div>
                <div class="text-h6">{{ result.turnaround }}분</div>
              </v-sheet>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-sheet class="pa-3 text-center">
                <div class="text-subtitle-1 font-weight-bold">난이도</div>
                <div class="text-h6">Level {{ result.level }}</div>
              </v-sheet>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-sheet class="pa-3 text-center">
                <div class="text-subtitle-1 font-weight-bold">코스형태</div>
                <div class="text-h6">{{ result.cycle }}</div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 코스 상세 정보 섹션 -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title class="text-h6">
              <v-icon start icon="mdi-information" class="mr-2"></v-icon>
              코스 개요
            </v-card-title>
            <v-card-text v-html="result.summary" class="text-body-1"></v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title class="text-h6">
              <v-icon start icon="mdi-map-marker" class="mr-2"></v-icon>
              상세 설명
            </v-card-title>
            <v-card-text class="text-body-1">{{ result.detail }}</v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title class="text-h6">
              <v-icon start icon="mdi-star" class="mr-2"></v-icon>
              여행 포인트
            </v-card-title>
            <v-card-text v-html="result.travelPoint" class="text-body-1"></v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title class="text-h6">
              <v-icon start icon="mdi-account-group" class="mr-2"></v-icon>
              여행자 정보
            </v-card-title>
            <v-card-text v-html="result.travelerInfo" class="text-body-1"></v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <!-- 이미지 캐러셀 -->
      <v-card class="mb-6 mt-6">
        <v-carousel cycle height="400" hide-delimiter-background show-arrows="hover">
          <v-carousel-item v-for="(image, i) in courseImages" :key="i" :src="image.src" cover>
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-carousel-item>
        </v-carousel>
      </v-card>
      <!-- 하단 정보 -->
      <v-card class="mt-6">
        <v-card-text class="text-caption">
          <div>등록일: {{ new Date(result.createdAt).toLocaleDateString() }}</div>
          <div>최종 수정일: {{ new Date(result.updatedAt).toLocaleDateString() }}</div>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { courseApi } from "@/api/courseApi";
import GpxMap from "../map/GpxMap.vue";

const route = useRoute();
const result = ref(null); // [] 대신 null로 변경
const isLoading = ref(false);

const props = defineProps({
  courseId: {
    type: String,
    required: false,
  },
});
const fetchCourses = async (courseId) => {
  isLoading.value = true;
  try {
    const data = await courseApi.getCourseDetail(courseId);
    result.value = data.result;
  } catch (error) {
    console.error("Failed to fetch course details:", error);
  } finally {
    isLoading.value = false;
  }
};
watch(
  () => props.courseId,
  (newId) => {
    if (newId) {
      fetchCourses(newId);
    }
  },
  { immediate: true }
);

// 랜덤 이미지 생성 (실제 구현시에는 실제 이미지로 교체)
// const getRandomImage = (id) => {
//   return `https://picsum.photos/seed/${id}/500/300`;
// };
const courseImages = ref([]);

// 초기 데이터 로드
// onMounted(() => {
//   const courseId = route.params.id;
//   console.log(courseId);
//   fetchCourses(courseId);
// });
onMounted(async () => {
  isLoading.value = true;
  try {
    // props.routeId가 있으면 사용하고, 없으면 route.params.id 사용
    const courseId = props.courseId || route.params.id;
    console.log(courseId);
    if (courseId) {
      await fetchCourses(courseId);
    }
  } catch (error) {
    console.error("Error in onMounted:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped></style>
