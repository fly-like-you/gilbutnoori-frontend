<template>
  <v-container fluid class="no-scroll">
    <v-row class="fill-height">
      <!-- 왼쪽 영역: 장소 목록과 검색 기능 -->
      <v-col cols="12" md="3" class="fill-height overflow-y-auto data-sidebar">
        <v-text-field v-model="searchQuery" label="장소명을 입력하세요" append-icon="mdi-magnify" class="mb-4" />
        <v-list>
          <v-list-item v-for="(trail, index) in filteredTrails" :key="index">
            <v-card outlined class="mb-3">
              <v-card-title>{{ trail.name }}</v-card-title>
              <v-card-actions>
                <v-btn icon @click="selectTrail(trail)">
                  <v-icon>{{ selectedTrails.includes(trail) ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- 선택한 장소 섹션 (왼쪽 하단 절반) -->
      <v-col cols="12" md="3" class="fill-height overflow-y-auto selected-sidebar">
        <h3>선택한 장소</h3>
        <div ref="sortableList" class="selected-trail-list">
          <div v-for="(trail, index) in selectedTrails" :key="trail.name" class="selected-trail-item">
            <div class="drag-handle">
              <v-icon left>mdi-drag</v-icon>
            </div>
            <div>
              <h4>{{ trail.name }}</h4>
              <p>선택한 장소 {{ index + 1 }}</p>
            </div>
          </div>
        </div>
      </v-col>

      <!-- 지도 섹션 (오른쪽 절반) -->
      <v-col cols="12" md="6" class="fill-height">
        <div id="map" class="map-container"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { onMounted, ref, computed, watch } from 'vue';
import Sortable from 'sortablejs';
import trailData from '@/data/trailData.js';

export default {
  name: 'MapAndDataPage',
  setup() {
    const map = ref(null);
    const trails = ref(trailData);
    const selectedTrails = ref([]);
    const searchQuery = ref('');
    const markers = ref([]);
    const polylines = ref(null);
    const sortableList = ref(null);

    const filteredTrails = computed(() => {
      if (!searchQuery.value) return trails.value;
      return trails.value.filter((trail) => trail.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    });

    const initKakaoMap = () => {
      try {
        const container = document.getElementById('map');
        if (!container) {
          throw new Error('지도 컨테이너를 찾을 수 없습니다.');
        }

        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 9,
        };

        map.value = new window.kakao.maps.Map(container, options);

        // 지도 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.value.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        console.log('지도 초기화 성공');
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        alert('지도 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
      }
    };

    const selectTrail = (trail) => {
      if (!selectedTrails.value.includes(trail)) {
        selectedTrails.value.push(trail);
        moveToLocation(trail);
      }
    };

    const moveToLocation = (trail) => {
      try {
        if (!map.value) {
          console.error('지도가 초기화되지 않았습니다.');
          return;
        }
        const newCenter = new window.kakao.maps.LatLng(trail.lat, trail.lng);
        map.value.setCenter(newCenter);
      } catch (error) {
        console.error('위치 이동 실패:', error);
      }
    };

    const updateMap = () => {
      try {
        if (!map.value) return;

        // Clear existing markers
        markers.value.forEach((marker) => marker.setMap(null));
        markers.value = [];

        // Clear existing polylines
        if (polylines.value) {
          polylines.value.setMap(null);
        }

        // Add new markers for selected trails
        selectedTrails.value.forEach((trail, idx) => {
          const markerPosition = new window.kakao.maps.LatLng(trail.lat, trail.lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
          });
          const label = new window.kakao.maps.CustomOverlay({
            position: markerPosition,
            content: `<div style="background-color: #007bff; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${
              idx + 1
            }</div>`,
          });
          marker.setMap(map.value);
          label.setMap(map.value);
          markers.value.push(marker);
        });

        // Draw polyline connecting selected trails
        if (selectedTrails.value.length > 1) {
          const linePath = selectedTrails.value.map((trail) => new window.kakao.maps.LatLng(trail.lat, trail.lng));
          polylines.value = new window.kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 4,
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
          });
          polylines.value.setMap(map.value);
        }
      } catch (error) {
        console.error('지도 업데이트 실패:', error);
      }
    };

    onMounted(() => {
      const script = document.createElement('script');
      const apiKey = 'f6c418eb4436b545e5fdb79fe4c4e71e';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.onerror = (error) => {
        console.error('Kakao Maps API 로드 실패:', error);
        alert('지도 로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
      };

      script.onload = () => {
        try {
          console.log('Kakao Maps API 스크립트 로드 완료');
          window.kakao.maps.load(() => {
            console.log('Kakao Maps API 로드 완료');
            initKakaoMap();

            watch(
              selectedTrails,
              () => {
                updateMap();
              },
              { deep: true }
            );

            if (sortableList.value) {
              Sortable.create(sortableList.value, {
                handle: '.drag-handle',
                animation: 150,
                onEnd: () => {
                  updateSelectedTrailsOrder();
                },
              });
            }
          });
        } catch (error) {
          console.error('Kakao Maps 초기화 실패:', error);
        }
      };

      document.head.appendChild(script);
    });

    const updateSelectedTrailsOrder = () => {
      try {
        if (!sortableList.value) return;

        const updatedTrails = [];
        sortableList.value.querySelectorAll('.selected-trail-item').forEach((item) => {
          const trailName = item.querySelector('h4').innerText;
          const trail = selectedTrails.value.find((t) => t.name === trailName);
          if (trail) {
            updatedTrails.push(trail);
          }
        });
        selectedTrails.value = updatedTrails;
        updateMap();
      } catch (error) {
        console.error('선택된 장소 순서 업데이트 실패:', error);
      }
    };

    return {
      map,
      trails,
      selectedTrails,
      searchQuery,
      filteredTrails,
      selectTrail,
      updateMap,
      sortableList,
    };
  },
};
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.no-scroll {
  height: 100%;
  overflow: hidden;
}

.data-sidebar {
  max-height: 100vh;
  overflow-y: auto;
}

.selected-sidebar {
  max-height: 100vh;
  overflow-y: auto;
}

.map-container {
  height: 100vh;
  width: 100%;
  background-color: lightgray;
}

.selected-trail-list {
  display: flex;
  flex-direction: column;
}

.selected-trail-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  cursor: grab;
}

.drag-handle {
  margin-right: 10px;
  cursor: grab;
}
</style>
