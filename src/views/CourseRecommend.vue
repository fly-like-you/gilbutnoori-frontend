<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedRoute"
          :items="mainRoutes"
          label="둘레길"
          item-title="name"
          item-value="id"
          @update:model-value="handleRouteSelect"
          return-object
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <div style="width:100%; height:600px;">
          <KakaoMap 
            ref="kakaoMap"
            :lat="mapCenter.lat" 
            :lng="mapCenter.lng"
            :level="mapLevel"
          >
            <KakaoMapPolyline 
              v-if="pathPoints.length > 0"
              :latLngList="pathPoints"
              :strokeWeight="5"
              :strokeColor="getRouteColor(selectedRoute.id)"
              :strokeOpacity="1.0"
              @mouseover="handleMouseOver"
              @mouseout="handleMouseOut"
            />
          </KakaoMap>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { KakaoMap, KakaoMapPolyline } from 'vue3-kakao-maps';
import axios from 'axios';

const selectedRoute = ref(null);
const mainRoutes = ref([]);
const pathPoints = ref([]);
const mapCenter = ref({ lat: 35.1796, lng: 129.0756 });
const mapLevel = ref(7);
const kakaoMap = ref(null);
let customOverlay = null;

const routeColors = {
  'T_ROUTE_MNG0000000001': '#FF0000', // 남파랑길
  'T_ROUTE_MNG0000000043': '#2196F3', // 서해랑길
  'T_ROUTE_MNG0000000047': '#4CAF50', // DMZ 평화의 길
  'T_THEME_MNG0000011235': '#FFC107', // 해파랑길
  'T_THEME_MNG0000010849': '#9C27B0'  // 물소리길
};

const getRouteColor = (routeId) => {
  return routeColors[routeId] || '#000000';
};

const adjustMapView = (points) => {
  if (points.length === 0) return;

  let minLat = points[0].lat, maxLat = points[0].lat;
  let minLng = points[0].lng, maxLng = points[0].lng;

  points.forEach(point => {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  });

  mapCenter.value = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2
  };

  // 경로 전체가 한 눈에 보이도록 레벨 조정
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  // 계수를 12로 설정하여 적절한 줌 레벨 유지
  mapLevel.value = Math.max(Math.ceil(Math.max(latDiff, lngDiff) * 12), 3);
};

const handleMouseOver = (mouseEvent) => {
  if (!selectedRoute.value || !kakaoMap.value) return;

  const content = document.createElement('div');
  content.className = 'custom-overlay';
  content.innerHTML = `
    <div class="route-info">
      <div class="route-header">
        <span class="route-title">${selectedRoute.value.name}</span>
      </div>
      <div class="route-stats">
        ${selectedRoute.value.dist || '16.2'}km • ${selectedRoute.value.turnaround || '6'}시간 • 보통
      </div>
    </div>
  `;

  const mapInstance = kakaoMap.value.getMap();
  customOverlay = new window.kakao.maps.CustomOverlay({
    position: mouseEvent.latLng,
    content: content,
    yAnchor: 1.5
  });

  customOverlay.setMap(mapInstance);
};

const handleMouseOut = () => {
  if (customOverlay) {
    customOverlay.setMap(null);
    customOverlay = null;
  }
};

const fetchMainRoutes = async () => {
  try {
    const response = await axios.get('http://localhost:8080/routes');
    if (response.data.isSuccess) {
      mainRoutes.value = response.data.result.routes;
    }
  } catch (error) {
    console.error('둘레길 목록 로딩 실패:', error);
  }
};

const handleRouteSelect = async () => {
  if (!selectedRoute.value) return;
  pathPoints.value = [];
  
  try {
    const coursesResponse = await axios.get(`http://localhost:8080/courses/search`, {
      params: { routeId: selectedRoute.value.id }
    });

    if (coursesResponse.data.isSuccess) {
      const courses = coursesResponse.data.result.courses;
      
      for (const course of courses) {
        const gpxResponse = await axios.post(`http://localhost:8080/courses/map/${course.id}`);
        if (gpxResponse.data.isSuccess) {
          const points = parseGpxData(gpxResponse.data.result);
          pathPoints.value = [...pathPoints.value, ...points];
        }
      }

      adjustMapView(pathPoints.value);
    }
  } catch (error) {
    console.error('GPX 데이터 로딩 실패:', error);
  }
};

const parseGpxData = (gpxString) => {
  const parser = new DOMParser();
  const gpx = parser.parseFromString(gpxString, 'text/xml');
  const trackPoints = gpx.getElementsByTagName('trkpt');
  
  const points = [];
  for (let point of trackPoints) {
    points.push({
      lat: parseFloat(point.getAttribute('lat')),
      lng: parseFloat(point.getAttribute('lon'))
    });
  }
  
  return points;
};

onMounted(() => {
  fetchMainRoutes();
});
</script>

<style scoped>
.custom-overlay {
  position: relative;
  bottom: 85px;
  border-radius: 6px;
  float: left;
}

.route-info {
  padding: 5px 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.route-header {
  margin-bottom: 3px;
}

.route-title {
  font-weight: bold;
  font-size: 14px;
}

.route-stats {
  font-size: 12px;
  color: #666;
}
</style>