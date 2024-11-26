<template>
  <div class="map-container">
    <v-progress-circular v-if="isLoading" indeterminate color="primary" class="ma-auto d-block"></v-progress-circular>

    <template v-else>
      <KakaoMap :lat="centerPosition.lat" :lng="centerPosition.lng" :level="6" style="width: 100%; height: 500px">
        <KakaoMapPolyline
          :latLngList="coordinates"
          :strokeWeight="4"
          :strokeColor="'#DB4455'"
          :strokeOpacity="1"
          :strokeStyle="'solid'"
        />
      </KakaoMap>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { KakaoMap, KakaoMapPolyline } from "vue3-kakao-maps";
import { courseApi } from "@/api/courseApi";

const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
});

const isLoading = ref(true);
const coordinates = ref([]);
const courseData = ref(null);

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
    return { lat: 35.5, lng: 127.5 }; // 한국 중심 좌표
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
    const response = await courseApi.getCourseMap(props.courseId);
    courseData.value = response;
    console.log("fetchGPXData", courseData);

    if (response.isSuccess && response.result) {
      coordinates.value = parseGPX(response.result);
    }
  } catch (error) {
    console.error("Failed to fetch GPX data:", error);
  } finally {
    isLoading.value = false;
  }
};
watch(
  () => props.courseId,
  () => fetchGPXData(),
  { immediate: true }
);
onMounted(() => {
  fetchGPXData();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  position: relative;
}
</style>
