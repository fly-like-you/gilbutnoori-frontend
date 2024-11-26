<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters style="height: 100%">
      <!-- 좌측 폼 영역 -->
      <v-col cols="4" class="pr-4">
        <v-card class="fill-height">
          <v-card-title class="text-h6">여행 계획하기</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="isFormValid">
              <!-- 둘레길 선택 -->
              <v-select
                v-model="selectedRoute"
                :items="routes"
                item-title="name"
                item-value="id"
                label="둘레길 선택"
                :rules="[(v) => !!v || '둘레길을 선택해주세요']"
                @update:modelValue="handleRouteSelect"
                @focus="handleRouteSelectFocus"
                @blur="handleRouteSelectBlur"
                :menu-props="{ contentClass: 'custom-select-menu' }"
              >
                <template v-slot:item="{ item, props: slotProps }">
                  <v-list-item
                    v-bind="slotProps"
                    @mouseenter="handleRouteItemHover(item.raw)"
                    @mouseleave="handleRouteItemLeave"
                  >
                  </v-list-item>
                </template>
              </v-select>

              <!-- 코스 선택 -->
              <v-select
                v-model="selectedCourse"
                :items="courses"
                item-title="name"
                item-value="id"
                label="코스 선택"
                :rules="[(v) => !!v || '코스를 선택해주세요']"
                :disabled="!selectedRoute"
                @update:modelValue="handleCourseSelect"
                @focus="handleCourseSelectFocus"
                @blur="handleCourseSelectBlur"
                :menu-props="{ contentClass: 'custom-select-menu' }"
              >
                <template v-slot:item="{ item, props: slotProps }">
                  <v-list-item
                    v-bind="slotProps"
                    @mouseenter="handleCourseItemHover(item.raw)"
                    @mouseleave="handleCourseItemLeave"
                  >
                  </v-list-item>
                </template>
              </v-select>

              <!-- 여행 날짜 선택 -->
              <v-date-picker
                v-model="selectedDate"
                :rules="[(v) => !!v || '날짜를 선택해주세요']"
                :disabled="!selectedCourse"
                class="mt-4"
                @update:modelValue="handleDateSelect"
                @focus="handleDatePickerFocus"
                @mouseenter="handleDatePickerEnter"
                @mouseleave="handleDatePickerLeave"
              ></v-date-picker>
            </v-form>
          </v-card-text>

          <!-- 여행 생성 버튼 -->
          <v-card-actions class="justify-center pb-4">
            <v-btn color="primary" :disabled="!isAllSelected" @click="openTravelDialog" size="large">
              여행 생성하기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측 상세 정보 영역 -->
      <v-col cols="8">
        <v-card class="fill-height">
          <v-card-text>
            <Transition name="fade">
              <div v-if="displayRouteDetail">
                <RouteDetail :route-id="currentRouteId" />
              </div>
              <div v-else-if="displayCourseDetail">
                <CourseDetail :course-id="currentCourseId" />
              </div>
              <div v-else-if="displayWeatherDetail">
                <WeatherDetail :route-id="selectedRoute" :course-id="selectedCourse" :selected-date="selectedDate" />
              </div>
              <div v-else class="d-flex justify-center align-center fill-height">
                <v-icon size="64" color="grey lighten-1">mdi-map-search</v-icon>
              </div>
            </Transition>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 여행 생성 다이얼로그 컴포넌트 -->
    <TravelCreateSnackBar
      v-model:showDialog="showTravelDialog"
      :selected-date="selectedDate"
      :selected-course="selectedCourse"
      @travel-created="handleTravelCreated"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import RouteDetail from "../route/RouteDetail.vue";
import CourseDetail from "./CourseDetail.vue";
import WeatherDetail from "../weather/WeatherDetail.vue";
import TravelCreateSnackBar from "../travel/TravelCreateSnackVar.vue";

import axios from "axios";

// 기본 상태 관리
const selectedRoute = ref(null);
const selectedCourse = ref(null);
const selectedDate = ref(null);
const isFormValid = ref(false);
const routes = ref([]);
const courses = ref([]);

// 포커스 및 호버 상태 관리
const isRouteSelectFocused = ref(false);
const isCourseSelectFocused = ref(false);
const isDatePickerFocused = ref(false);
const hoveredRouteId = ref(null);
const hoveredCourseId = ref(null);

// 상태 관리
const showTravelDialog = ref(false);

// 다이얼로그 열기
const openTravelDialog = () => {
  showTravelDialog.value = true;
};

// 여행 생성 완료 핸들러
const handleTravelCreated = () => {
  // 필요한 경우 부모 컴포넌트에서 추가 작업 수행
  // 예: 폼 초기화, 데이터 새로고침 등
  selectedRoute.value = null;
  selectedCourse.value = null;
  selectedDate.value = null;
};

// 현재 표시할 ID 계산
const currentRouteId = computed(() => {
  return hoveredRouteId.value || selectedRoute.value;
});
const currentCourseId = computed(() => hoveredCourseId.value || selectedCourse.value);

// 표시 상태 계산
const displayRouteDetail = computed(
  () =>
    (isRouteSelectFocused.value || hoveredRouteId.value) && !isCourseSelectFocused.value && !isDatePickerFocused.value
);

const displayCourseDetail = computed(
  () =>
    ((isCourseSelectFocused.value || hoveredCourseId.value) && !isDatePickerFocused.value) ||
    (selectedCourse.value && !isRouteSelectFocused.value && !isDatePickerFocused.value)
);

const displayWeatherDetail = computed(
  () => isDatePickerFocused.value || (selectedDate.value && !isRouteSelectFocused.value && !isCourseSelectFocused.value)
);
const isAllSelected = computed(() => {
  return selectedRoute.value && selectedCourse.value && selectedDate.value;
});

// Route Select 이벤트 핸들러
const handleRouteSelectFocus = () => {
  isRouteSelectFocused.value = true;
  isCourseSelectFocused.value = false;
  isDatePickerFocused.value = false;
};

const handleRouteSelectBlur = () => {
  isRouteSelectFocused.value = false;
  hoveredRouteId.value = null;
};

const handleRouteItemHover = (route) => {
  hoveredRouteId.value = route.id;
};

const handleRouteItemLeave = () => {
  hoveredRouteId.value = null;
};

// Course Select 이벤트 핸들러
const handleCourseSelectFocus = () => {
  isCourseSelectFocused.value = true;
  isRouteSelectFocused.value = false;
  isDatePickerFocused.value = false;
};

const handleCourseSelectBlur = () => {
  isCourseSelectFocused.value = false;
  hoveredCourseId.value = null;
};

const handleCourseItemHover = (course) => {
  hoveredCourseId.value = course.id;
};

const handleCourseItemLeave = () => {
  hoveredCourseId.value = null;
};

// Date Picker 이벤트 핸들러
const handleDatePickerFocus = () => {
  isDatePickerFocused.value = true;
  isRouteSelectFocused.value = false;
  isCourseSelectFocused.value = false;
};

const handleDatePickerEnter = () => {
  isDatePickerFocused.value = true;
};

const handleDatePickerLeave = () => {
  if (!selectedDate.value) {
    isDatePickerFocused.value = false;
  }
};

// API 요청 핸들러
const fetchRoutes = async () => {
  try {
    const response = await axios.get("http://localhost:8080/routes");
    if (response.data.isSuccess) {
      routes.value = response.data.result.routes;
    }
  } catch (error) {
    console.error("둘레길 목록 로딩 실패:", error);
  }
};

const fetchCourses = async (routeId) => {
  try {
    const response = await axios.get(`http://localhost:8080/courses/search`, {
      params: { routeId },
    });
    if (response.data.isSuccess) {
      courses.value = response.data.result.courses;
    }
  } catch (error) {
    console.error("코스 로딩 실패:", error);
  }
};

// 선택 이벤트 핸들러
const handleRouteSelect = async (routeId) => {
  await fetchCourses(routeId);
  selectedCourse.value = null;
  selectedDate.value = null;
};

const handleCourseSelect = (courseId) => {
  console.log("Selected course:", courseId);
};

const handleDateSelect = (date) => {
  console.log("Selected date:", date);
};

// 초기 데이터 로드
onMounted(() => {
  fetchRoutes();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-select-menu {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.v-list-item) {
  transition: background-color 0.2s ease;
}

:deep(.v-list-item:hover) {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
