<template>
  <!-- 여행 생성 다이얼로그 -->
  <v-dialog v-model="dialogModel" max-width="500">
    <v-card>
      <v-card-title class="text-h5 pb-2"> 여행 계획 생성 </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-text-field
            v-model="travelTitle"
            label="여행 제목"
            :rules="[(v) => !!v || '여행 제목을 입력해주세요']"
            required
          ></v-text-field>

          <v-textarea
            v-model="travelContent"
            label="여행 설명"
            :rules="[(v) => !!v || '여행 설명을 입력해주세요']"
            required
            auto-grow
            rows="3"
          ></v-textarea>

          <v-row class="mt-2">
            <v-col cols="6">
              <v-text-field
                :value="selectedDate"
                label="여행 날짜"
                readonly
                disabled
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="selectedCourse?.name"
                label="선택된 코스"
                readonly
                disabled
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeDialog"> 취소 </v-btn>
        <v-btn
          color="primary"
          variant="text"
          :loading="isSubmitting"
          :disabled="!isFormValid || isSubmitting"
          @click="submitTravel"
        >
          생성하기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 성공 알림 스낵바 -->
  <v-snackbar v-model="showSnackbar" :timeout="2000" color="success" location="top">
    <div class="d-flex flex-column align-center" style="width: 100%">
      <!-- 텍스트와 버튼을 포함하는 상단 영역 -->
      <div class="d-flex align-center justify-center width-100 mb-2">
        <span class="text-center">여행 계획 생성 완료</span>
      </div>

      <!-- 하단 프로그래스 바 -->
      <v-progress-linear
        v-model="progress"
        color="white"
        height="5"
        class="mt-2"
        style="width: 100%"
      ></v-progress-linear>
    </div>
  </v-snackbar>
</template>
<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { createTravel } from "@/api/travel";
import { useCourseStore } from "@/store/travel";

// v-model 바인딩을 위한 computed 속성

// 다이얼로그 닫기 메서드
const closeDialog = () => {
  emit("update:showDialog", false);
};

// Props 정의
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  selectedCourse: {
    type: String,
    required: true,
  },
});

// Emits 정의
const emit = defineEmits(["update:show-dialog", "travel-created"]);

// v-model 바인딩을 위한 computed 속성
const dialogModel = computed({
  get: () => props.showDialog,
  set: (value) => emit("update:show-dialog", value),
});

// 나머지 상태 관리
const router = useRouter();
const form = ref(null);
const showSnackbar = ref(false);
const isFormValid = ref(false);
const isSubmitting = ref(false);
const progress = ref(0);
const travelTitle = ref("");
const travelContent = ref("");
const courseStore = useCourseStore();

// 프로그레스 바 타이머
let progressInterval;

const startProgress = (travelId) => {
  progress.value = 0;
  progressInterval = setInterval(() => {
    progress.value += 2;
    if (progress.value >= 100) {
      clearInterval(progressInterval);
      navigateToMyPage(travelId);
    }
  }, 40);
};

const resetForm = () => {
  travelTitle.value = "";
  travelContent.value = "";
  if (form.value) {
    form.value.reset();
  }
};

const submitTravel = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  createTravel(
    {
      title: travelTitle.value,
      content: travelContent.value,
      courseId: props.selectedCourse,
      startDate: props.selectedDate,
    },
    (response) => {
      if (response.data.isSuccess) {
        dialogModel.value = false;
        showSnackbar.value = true;
        startProgress(response.data.result.id);
        resetForm();
        emit("travel-created"); // 부모 컴포넌트에 생성 완료 알림
      }
    },
    (error) => {
      console.error("여행 생성 실패:", error);
    }
  );
};

const navigateToMyPage = (travelId) => {
  clearInterval(progressInterval);
  showSnackbar.value = false;
  console.log(travelId);

  // 현재 선택된 코스 정보를 가져와서 저장
  const currentCourse = courseStore.getSelectedCourse;
  console.log("전송하기 -> ", currentCourse);
  router.push({
    name: "TravelPlanPlanner",
    params: {
      travelId: travelId,
      courseId: currentCourse,
    },
  });
};

// 컴포넌트가 언마운트될 때 타이머 정리
onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});

// 다이얼로그가 닫힐 때 폼 초기화
watch(dialogModel, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

// props가 변경될 때마다 store에 저장
watch(
  () => props.selectedCourse,
  (newCourse) => {
    console.log(newCourse);
    courseStore.setSelectedCourse(newCourse);
  },
  { immediate: true }
); // immediate: true로 설정하여 초기값도 저장
</script>

<style scoped>
.v-snackbar__content {
  width: 100%;
}

/* 프로그레스 바 애니메이션 */
.v-progress-linear {
  transition: all 0.2s ease;
}
</style>
