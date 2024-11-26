<!-- TravelPlanner.vue -->
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { getToken, TOKEN_TYPE } from "@/util/auth";
import { KakaoMap, KakaoMapMarker, KakaoMapPolyline } from "vue3-kakao-maps";

const route = useRoute();
const router = useRouter();

// State management
const attractions = ref([]);
const selectedAttractions = ref([]);
const searchQuery = ref("");
const contentTypeId = ref("12");
const currentPage = ref(1);
const totalPages = ref(0);
const showMiddlePanel = ref(true);
const isLoading = ref(true);
const coordinates = ref([]);
const draggedItem = ref(null);
const kakaoMap = ref();
const onLoadKakaoMap = (mapRef) => {
  kakaoMap.value = mapRef;
};
const travelId = route.params.travelId;
const courseId = route.params.courseId;
const pushAndMoveAttraction = (attraction) => {
  selectedAttractions.value.push(attraction);
  console.log(attraction);
  kakaoMap.value.panTo(new kakao.maps.LatLng(attraction.latitude, attraction.longitude));
};

// GPX 파싱 함수
const parseGPX = (gpxString) => {
  const parser = new DOMParser();
  const gpx = parser.parseFromString(gpxString, "text/xml");
  const trackPoints = gpx.getElementsByTagName("trkpt");

  const coords = [];
  for (let point of trackPoints) {
    coords.push({
      lat: parseFloat(point.getAttribute("lat")),
      lng: parseFloat(point.getAttribute("lon")),
    });
  }
  return coords;
};

// 중심 좌표 계산
const centerPosition = computed(() => {
  if (coordinates.value.length === 0) {
    return { lat: 35.5, lng: 127.5 };
  }

  const latSum = coordinates.value.reduce((sum, coord) => sum + coord.lat, 0);
  const lngSum = coordinates.value.reduce((sum, coord) => sum + coord.lng, 0);

  return {
    lat: latSum / coordinates.value.length,
    lng: lngSum / coordinates.value.length,
  };
});

// GPX 데이터 가져오기
const fetchGPXData = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post(`http://localhost:8080/courses/map/${courseId}`);
    if (response.data.isSuccess && response.data.result) {
      coordinates.value = parseGPX(response.data.result);
    }
  } catch (error) {
    console.error("Failed to fetch GPX data:", error);
  } finally {
    isLoading.value = false;
  }
};

// API 호출 함수
const fetchAttractions = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/attractions/courses/${courseId}/travelPoint`,
      {
        params: {
          sort: "id,desc",
          contentTypeId: contentTypeId.value,
          size: 10,
          page: currentPage.value - 1,
        },
      }
    );
    attractions.value = response.data.result.attractions;
    totalPages.value = response.data.result.totalPages;
  } catch (error) {
    console.error("Error fetching attractions:", error);
  }
};

// 여행 계획 생성
const createTravelPlan = async () => {
  const planData = selectedAttractions.value.map((attraction, index) => ({
    attractionId: attraction.id,
    travelId: parseInt(travelId),
    sequence: index + 1,
    ...(attraction.isCourse ? { courseId: courseId } : {}),
  }));
  planData.push({
    travelId: parseInt(travelId),
    sequence: 0,
    courseId: courseId,
  });
  console.log(planData);
  const token = getToken(TOKEN_TYPE.ACCESS);
  try {
    await axios.post("http://localhost:8080/plans", planData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    router.push({
      name: "article-write",
    });
  } catch (error) {
    console.error("Error creating travel plan:", error);
  }
};

// 선택된 관광지 경로
const attractionsPath = computed(() => {
  return selectedAttractions.value.map((attraction) => ({
    lat: attraction.latitude,
    lng: attraction.longitude,
  }));
});

// 검색 필터링
const filteredAttractions = computed(() => {
  if (!searchQuery.value) return attractions.value;
  return attractions.value.filter((attraction) =>
    attraction.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 드래그 앤 드롭 핸들러
const onDragStart = (attraction) => {
  draggedItem.value = attraction;
};

const onDragOver = (event) => {
  event.preventDefault();
};

const onDrop = (event, dropIndex) => {
  event.preventDefault();
  if (!draggedItem.value) return;

  const draggedIndex = selectedAttractions.value.findIndex(
    (item) => item.id === draggedItem.value.id
  );

  if (draggedIndex === -1) {
    selectedAttractions.value.splice(dropIndex, 0, draggedItem.value);
  } else {
    const [removed] = selectedAttractions.value.splice(draggedIndex, 1);
    selectedAttractions.value.splice(dropIndex, 0, removed);
  }

  draggedItem.value = null;
};

watch(() => fetchGPXData(), { immediate: true });

onMounted(() => {
  fetchAttractions();
  fetchGPXData();
});
</script>
<template>
  <v-container fluid class="travel-planner">
    <v-row dense class="layout-container">
      <!-- 좌측 패널 -->
      <v-col cols="12" md="3" class="left-panel">
        <v-card outlined class="search-panel">
          <v-card-title class="panel-title">관광지 검색</v-card-title>
          <v-card-text>
            <!-- 카테고리 선택 -->
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
              dense
              outlined
              class="mb-4"
              @update:model-value="fetchAttractions"
            />
            <!-- 검색 필드 -->
            <v-text-field
              v-model="searchQuery"
              label="관광지 검색"
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              class="search-input"
            />
            <!-- 관광지 리스트 -->
            <div class="attractions-list">
              <v-list>
                <v-list-item
                  v-for="attraction in filteredAttractions"
                  :key="attraction.id"
                  class="attraction-item"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ attraction.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ attraction.addr1 }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      color="primary"
                      variant="tonal"
                      size="small"
                      @click="pushAndMoveAttraction(attraction)"
                    >
                      선택
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
            <!-- 페이지네이션 -->
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              @update:model-value="fetchAttractions"
              class="mt-4 pagination"
              size="small"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 중앙 패널 -->
      <v-col cols="12" md="3" class="middle-panel">
        <v-card outlined class="plan-panel">
          <v-expand-transition>
            <v-card-text v-show="showMiddlePanel">
              <div class="selected-attractions">
                <v-list>
                  <v-list-item
                    v-for="(attraction, index) in selectedAttractions"
                    :key="attraction.id"
                    draggable="true"
                    class="selected-item"
                    @dragstart="onDragStart(attraction)"
                    @dragover="onDragOver"
                    @drop="onDrop($event, index)"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ attraction.title }}</v-list-item-title>
                      <v-list-item-subtitle>순서: {{ index + 1 }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        size="small"
                        @click="selectedAttractions.splice(index, 1)"
                      />
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </div>
              <v-btn
                block
                color="primary"
                class="create-plan-btn"
                @click="createTravelPlan"
                :disabled="selectedAttractions.length === 0"
              >
                여행 계획 생성하기
              </v-btn>
            </v-card-text>
          </v-expand-transition>
        </v-card>
      </v-col>

      <!-- 우측 패널 - 지도 -->
      <v-col cols="12" md="6" class="right-panel">
        <v-card outlined class="map-container">
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            color="primary"
            class="loading-indicator"
          />
          <template v-else>
            <KakaoMap
              :lat="centerPosition.lat"
              :lng="centerPosition.lng"
              :level="6"
              style="width: 100%; height: 100%"
              @onLoadKakaoMap="onLoadKakaoMap"
            >
              <!-- GPX 경로 -->
              <KakaoMapPolyline
                :latLngList="coordinates"
                :strokeWeight="4"
                :strokeColor="'#DB4455'"
                :strokeOpacity="1"
                :strokeStyle="'solid'"
              />
              <!-- 선택된 관광지 경로 -->
              <KakaoMapPolyline
                v-if="attractionsPath.length > 1"
                :latLngList="attractionsPath"
                :strokeWeight="3"
                :strokeColor="'#4CAF50'"
                :strokeOpacity="0.8"
                :strokeStyle="'solid'"
              />
              <!-- 관광지 마커 -->
              <KakaoMapMarker
                v-for="(attraction, index) in selectedAttractions"
                :key="attraction.id"
                :lat="attraction.latitude"
                :lng="attraction.longitude"
              >
                <div class="marker-label">{{ index + 1 }}</div>
              </KakaoMapMarker>
            </KakaoMap>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.travel-planner {
  height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.layout-container {
  max-height: 800px;
}
/* 공통 패널 스타일 */
.left-panel,
.middle-panel,
.right-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 패널 헤더 스타일 */
.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
}

/* 검색 패널 스타일링 */
.search-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-controls {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.category-select {
  margin-bottom: 1rem;
}

.category-select :deep(.v-field) {
  border-radius: 8px;
  background-color: #f8fafc;
}

.search-input {
  margin-bottom: 0.5rem;
}

.search-input :deep(.v-field) {
  border-radius: 8px;
  background-color: #f8fafc;
}

/* 관광지 리스트 스타일링 */
.attractions-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.attraction-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.attraction-item:hover {
  background-color: #f1f5f9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.attraction-info {
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우 방지 */
}

.attraction-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attraction-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 선택된 관광지 스타일링 */
.plan-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.selected-attractions {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.selected-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: move;
  transition: all 0.2s ease;
}

.selected-item:hover {
  background-color: #f1f5f9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.drag-handle {
  padding: 0.5rem;
  color: #64748b;
  cursor: move;
}

.drag-handle:hover {
  color: #1e293b;
}

/* 버튼 스타일링 */
.toggle-button {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

/* 페이지네이션 스타일링 */
.pagination {
  padding: 1rem;
  display: flex;
  justify-content: center;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
}

/* 지도 컨테이너 스타일링 */
.map-container {
  position: relative;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 마커 스타일링 */
.marker-label {
  background: #4caf50;
  color: white;
  padding: 4px 8px;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 반응형 스타일링 */
@media (max-width: 1600px) {
  .layout-container {
    grid-template-columns: 320px 360px 1fr;
  }
}

@media (max-width: 1400px) {
  .layout-container {
    grid-template-columns: 300px 340px 1fr;
  }
}
</style>
