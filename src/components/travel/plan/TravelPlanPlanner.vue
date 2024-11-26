<!-- TravelPlannerView.vue -->
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { KakaoMap, KakaoMapMarkerPolyline } from "vue3-kakao-maps";

// State 관리
const attractions = ref([]);
const selectedAttractions = ref([]);
const searchQuery = ref("");
const contentTypeId = ref("12");
const currentPage = ref(1);
const totalPages = ref(0);
const showMiddlePanel = ref(true);
const showSnackbar = ref(false);
const snackbarText = ref("");
const markerList = ref([]);
const router = useRouter();

// 고정 코스 정보 (예시)
const fixedCourse = ref({
  courseId: "T_CRS_MNG0000005120",
  title: "기본 둘레길 코스",
  sequence: 1,
});

// API 호출 함수
const fetchAttractions = async (page = 1) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/attractions/courses/${fixedCourse.value.courseId}/travelPoint`,
      {
        params: {
          sort: "id,desc",
          contentTypeId: contentTypeId.value,
          size: 5,
          page: page - 1,
        },
      }
    );

    if (response.data.isSuccess) {
      attractions.value = response.data.result.attractions;
      totalPages.value = response.data.result.totalPages;
    }
  } catch (error) {
    console.error("Error fetching attractions:", error);
    snackbarText.value = "관광지 정보를 불러오는데 실패했습니다.";
    showSnackbar.value = true;
  }
};

// 여행 계획 생성
const createTravelPlan = async () => {
  try {
    const planData = [
      {
        travelId: 9,
        courseId: fixedCourse.value.courseId,
        sequence: 1.0,
      },
      ...selectedAttractions.value.map((attraction, index) => ({
        attractionId: attraction.id,
        travelId: 9,
        sequence: index + 2.0,
      })),
    ];

    await axios.post("http://localhost:8080/plans", planData);

    snackbarText.value = "여행 계획이 성공적으로 생성되었습니다.";
    showSnackbar.value = true;

    setTimeout(() => {
      router.push("/mypage");
    }, 2000);
  } catch (error) {
    console.error("Error creating travel plan:", error);
    snackbarText.value = "여행 계획 생성에 실패했습니다.";
    showSnackbar.value = true;
  }
};

// 관광지 추가
const addAttraction = (attraction) => {
  selectedAttractions.value.push(attraction);
  updateMarkers();
};

// 마커 업데이트
const updateMarkers = () => {
  markerList.value = selectedAttractions.value.map((attraction) => ({
    lat: attraction.latitude,
    lng: attraction.longitude,
  }));
};

// 드래그 앤 드롭 처리
const handleDrop = (event) => {
  const { oldIndex, newIndex } = event;
  const item = selectedAttractions.value.splice(oldIndex, 1)[0];
  selectedAttractions.value.splice(newIndex, 0, item);
  updateMarkers();
};

onMounted(() => {
  fetchAttractions();
});
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row class="fill-height">
      <!-- 좌측 패널 - 관광지 검색 -->
      <v-col cols="3" class="pa-2">
        <v-card>
          <v-card-title>관광지 검색</v-card-title>
          <v-card-text>
            <v-select
              v-model="contentTypeId"
              :items="[
                { title: '관광지', value: '12' },
                { title: '문화시설', value: '14' },
                { title: '축제공연행사', value: '15' },
                { title: '여행코스', value: '25' },
                { title: '레포츠', value: '28' },
                { title: '숙박', value: '32' },
                { title: '쇼핑', value: '38' },
                { title: '음식점', value: '39' },
              ]"
              item-title="title"
              item-value="value"
              label="카테고리"
              @update:model-value="fetchAttractions"
            />

            <v-text-field v-model="searchQuery" label="관광지 검색" prepend-inner-icon="mdi-magnify" clearable />

            <v-list>
              <v-list-item v-for="attraction in attractions" :key="attraction.id" :title="attraction.title">
                <template v-slot:append>
                  <v-btn color="primary" size="small" @click="addAttraction(attraction)"> 선택 </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <v-pagination v-model="currentPage" :length="totalPages" @update:model-value="fetchAttractions" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 중앙 패널 - 선택된 관광지 목록 -->
      <v-col cols="4" class="pa-2" v-show="showMiddlePanel">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>여행 계획</span>
            <v-btn icon @click="showMiddlePanel = !showMiddlePanel">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list>
              <!-- 고정 코스 -->
              <v-list-item :title="fixedCourse.title" subtitle="고정 코스" class="mb-2">
                <template v-slot:prepend>
                  <v-icon>mdi-map-marker-path</v-icon>
                </template>
              </v-list-item>

              <!-- 선택된 관광지 목록 -->
              <draggable v-model="selectedAttractions" item-key="id" @end="handleDrop">
                <template #item="{ element }">
                  <v-list-item :title="element.title" :subtitle="element.addr1">
                    <template v-slot:prepend>
                      <v-icon>mdi-map-marker</v-icon>
                    </template>
                    <template v-slot:append>
                      <v-btn
                        icon
                        color="error"
                        size="small"
                        @click="selectedAttractions = selectedAttractions.filter((a) => a.id !== element.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
              </draggable>
            </v-list>

            <v-btn block color="primary" class="mt-4" @click="createTravelPlan"> 여행 계획 생성하기 </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 우측 패널 - 지도 -->
      <v-col :cols="showMiddlePanel ? 5 : 9" class="pa-2">
        <v-card height="100%">
          <KakaoMap :lat="35.5671609878" :lng="129.1124285363" style="width: 100%; height: 100%">
            <KakaoMapMarkerPolyline :markerList="markerList" />
          </KakaoMap>
        </v-card>
      </v-col>
    </v-row>

    <!-- 스낵바 -->
    <v-snackbar v-model="showSnackbar" :timeout="2000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
