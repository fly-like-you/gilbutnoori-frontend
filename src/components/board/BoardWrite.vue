<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-6">여행 후기 작성</h2>

        <!-- 여행 선택 섹션 -->
        <v-expansion-panels class="mb-6">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-icon class="mr-2">mdi-map-marker-path</v-icon>
                  {{ selectedTravel ? selectedTravel.title : "여행 선택하기" }}
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list select-strategy="single-select" v-if="travels.length > 0">
                <v-list-item
                  v-for="travel in travels"
                  :key="travel.id"
                  :value="travel"
                  @click="selectTravel(travel)"
                  :active="selectedTravel && selectedTravel.id === travel.id"
                >
                  <v-list-item-title>{{ travel.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ travel.course.route.name }} - {{ travel.course.name }}
                    <br />
                    여행일자: {{ formatDate(travel.startDate) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" text="등록된 여행이 없습니다."></v-alert>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- 여행 선택 시 좌우 분할 레이아웃 -->
        <v-row v-if="selectedTravel">
          <!-- 왼쪽: 여정 표시 섹션 -->
          <v-col cols="12" md="4" class="pr-md-4">
            <v-card class="sticky-card">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-map-marker-path</v-icon>
                여행 여정
              </v-card-title>
              <v-card-text class="timeline-container">
                <v-timeline density="comfortable">
                  <v-timeline-item
                    v-for="plan in sortedPlans"
                    :key="plan.id"
                    :dot-color="plan.attraction ? 'primary' : 'secondary'"
                    size="small"
                  >
                    <!-- 관광지인 경우 -->
                    <template v-if="plan.attraction">
                      <v-card class="mt-4">
                        <v-row no-gutters>
                          <v-col cols="12" md="4" v-if="plan.attraction.firstImage1">
                            <v-img :src="plan.attraction.firstImage1" height="200" cover></v-img>
                          </v-col>
                          <v-col cols="12" :md="plan.attraction.firstImage1 ? 8 : 12">
                            <v-card-text>
                              <div class="text-h6 mb-1">
                                {{ plan.attraction.title }}
                                <v-chip size="small" color="info" class="ml-2">
                                  {{ plan.attraction.contentType }}
                                </v-chip>
                              </div>
                              <div class="text-subtitle-2 text-grey">
                                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                                {{ plan.attraction.addr1 }}
                              </div>
                            </v-card-text>
                          </v-col>
                        </v-row>
                      </v-card>
                    </template>

                    <!-- 코스인 경우 -->
                    <template v-else-if="plan.course">
                      <v-card class="elevation-1 mt-4">
                        <v-card-text>
                          <div class="text-h6 mb-1">{{ plan.course.name || "코스" }}</div>
                          <v-chip size="small" color="secondary" class="mr-2"> 코스 </v-chip>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 오른쪽: 후기 작성 폼 -->
          <v-col cols="12" md="8">
            <v-card class="pa-6">
              <v-form @submit.prevent="submitBoard" ref="form">
                <v-text-field
                  v-model="title"
                  label="제목"
                  required
                  :rules="[(v) => !!v || '제목을 입력해주세요']"
                  class="mb-4"
                ></v-text-field>

                <v-textarea
                  v-model="content"
                  label="내용"
                  required
                  :rules="[(v) => !!v || '내용을 입력해주세요']"
                  class="mb-4"
                  auto-grow
                  rows="5"
                ></v-textarea>

                <!-- 이미지 업로드 -->
                <v-file-input
                  v-model="images"
                  label="사진 첨부"
                  multiple
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  class="mb-4"
                  :show-size="true"
                  chips
                >
                  <template v-slot:selection="{ fileNames }">
                    <template v-for="fileName in fileNames" :key="fileName">
                      <v-chip size="small" class="mr-2">
                        {{ fileName }}
                      </v-chip>
                    </template>
                  </template>
                </v-file-input>

                <!-- 미리보기 이미지 -->
                <v-row v-if="imagePreviewUrls.length > 0" class="mb-4">
                  <v-col v-for="(url, index) in imagePreviewUrls" :key="index" cols="12" sm="6" md="4">
                    <v-img :src="url" aspect-ratio="16/9" cover class="bg-grey-lighten-2">
                      <template v-slot:placeholder>
                        <v-row class="fill-height ma-0" align="center" justify="center">
                          <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                  </v-col>
                </v-row>

                <!-- 버튼 그룹 -->
                <v-card-actions class="pt-4">
                  <v-spacer></v-spacer>
                  <v-btn color="grey" variant="outlined" @click="cancel">취소</v-btn>
                  <v-btn color="primary" :loading="loading" :disabled="!isFormValid" type="submit"> 등록 </v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-col>
        </v-row>

        <!-- 여행 미선택시 후기 작성 폼 -->
        <v-row v-else>
          <v-col cols="12">
            <v-card class="pa-6">
              <v-alert type="info" text="여행을 선택하면 후기를 작성할 수 있습니다."></v-alert>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 스낵바 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { registArticle } from "@/api/board";
import { listTravels } from "@/api/travel";

// 라우터 설정
const router = useRouter();

// 상태 관리
const form = ref(null);
const travels = ref([]);
const selectedTravel = ref(null);
const title = ref("");
const content = ref("");
const images = ref([]);
const imagePreviewUrls = ref([]);
const loading = ref(false);
const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

// 정렬된 여행 계획 computed 속성
const sortedPlans = computed(() => {
  if (!selectedTravel.value?.plans?.planResult) return [];

  return [...selectedTravel.value.plans.planResult].sort((a, b) => a.sequence - b.sequence);
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  return title.value && content.value && selectedTravel.value;
});

// 여행 목록 가져오기
const fetchTravels = async () => {
  listTravels(
    (response) => {
      console.log(response);
      if (response.data.isSuccess) {
        travels.value = response.data.result.travels;
      }
    },
    (error) => {
      showSnackbar("여행 목록을 불러오는데 실패했습니다.", "error");
    }
  );
};

// 여행 선택
const selectTravel = (travel) => {
  selectedTravel.value = travel;
  console.log("Selected travel plans:", travel.plans.planResult);
};

// 이미지 미리보기 생성
watch(images, (newFiles) => {
  imagePreviewUrls.value = [];
  if (newFiles) {
    Array.from(newFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviewUrls.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
});

// 게시글 등록
const submitBoard = async () => {
  if (!isFormValid.value) return;

  const formData = {
    title: title.value,
    content: content.value,
    travelId: selectedTravel.value.id,
  };

  registArticle(
    formData,
    () => {
      showSnackbar("후기가 성공적으로 등록되었습니다.");
      router.push({ name: "BoardList" }); // 게시글 목록으로 이동
    },
    (error) => {
      showSnackbar("후기 등록에 실패했습니다.", error);
    }
  );
};

// 유틸리티 함수
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ko-KR");
};

const showSnackbar = (text, color = "success") => {
  snackbar.value = {
    show: true,
    text,
    color,
  };
};

const cancel = () => {
  router.go(-1);
};

// 컴포넌트 마운트
onMounted(() => {
  loading.value = true;
  fetchTravels();
  loading.value = false;
});
</script>

<style scoped>
.v-expansion-panel {
  margin-bottom: 1rem;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item--active {
  background-color: rgb(var(--v-theme-primary-lighten-1));
}

/* 여정 섹션 스타일 */
.sticky-card {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow: hidden;
}

.timeline-container {
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.v-timeline-item {
  margin-bottom: 1rem;
}

.v-timeline-item .v-card {
  transition: transform 0.2s;
}

.v-timeline-item .v-card:hover {
  transform: translateY(-2px);
}
</style>
