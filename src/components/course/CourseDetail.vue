<template>
  <div class="map-container">
    <!-- 로딩 표시 -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="loading-indicator"
    ></v-progress-circular>

    <!-- 지도 컨테이너 -->
    <div id="map" style="width: 100%; height: 500px;"></div>

    <!-- 에러 메시지 -->
    <v-alert
      v-if="error"
      type="error"
      class="mt-4"
    >
      {{ error }}
    </v-alert>

    <!-- 경로 정보 -->
    <v-card v-if="pathInfo" class="mt-4">
      <v-card-title>경로 정보</v-card-title>
      <v-card-text>
        <div>총 거리: {{ pathInfo.distance }}km</div>
        <div>예상 소요시간: {{ pathInfo.duration }}분</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'CourseDetail',
  props: {
    courseId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      map: null,
      path: null,
      loading: false,
      error: null,
      coordinates: [],
      pathInfo: null
    }
  },
  methods: {
    initializeKakaoMap() {
      return new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          // 이미 로드된 경우
          this.initMap();
          resolve();
        } else {
          // 로드되지 않은 경우 로드 대기
          const script = document.createElement('script');
          script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=f6c418eb4436b545e5fdb79fe4c4e71e&autoload=false`;
          script.onload = () => {
            window.kakao.maps.load(() => {
              this.initMap();
              resolve();
            });
          };
          document.head.appendChild(script);
        }
      });
    },

    initMap() {
      const container = document.getElementById('map');
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 8
      };
      this.map = new window.kakao.maps.Map(container, options);
    },

    async fetchGpxData() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:8080/courses/map/${this.courseId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('GPX 데이터를 불러오는데 실패했습니다.');
        }

        const gpxData = await response.text();
        this.coordinates = this.parseGpxData(gpxData);
        this.drawPath();
        this.calculatePathInfo();
      } catch (error) {
        console.error('GPX 데이터 로딩 오류:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    parseGpxData(gpxData) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxData, "text/xml");
      const trackpoints = xmlDoc.getElementsByTagName("trkpt");
      const coordinates = [];

      for (let point of trackpoints) {
        const lat = parseFloat(point.getAttribute("lat"));
        const lon = parseFloat(point.getAttribute("lon"));
        if (!isNaN(lat) && !isNaN(lon)) {
          coordinates.push(new window.kakao.maps.LatLng(lat, lon));
        }
      }

      return coordinates;
    },

    drawPath() {
      if (this.coordinates.length === 0) {
        this.error = "유효한 경로 데이터가 없습니다.";
        return;
      }

      // 기존 경로가 있다면 제거
      if (this.path) {
        this.path.setMap(null);
      }

      // 새 경로 그리기
      this.path = new window.kakao.maps.Polyline({
        path: this.coordinates,
        strokeWeight: 4,
        strokeColor: '#DB4455',
        strokeOpacity: 0.7,
        strokeStyle: 'solid'
      });

      this.path.setMap(this.map);

      // 경로가 모두 보이도록 지도 범위 조정
      const bounds = new window.kakao.maps.LatLngBounds();
      this.coordinates.forEach(coordinate => {
        bounds.extend(coordinate);
      });
      this.map.setBounds(bounds);
    },

    calculatePathInfo() {
      if (this.coordinates.length < 2) return;

      let totalDistance = 0;
      for (let i = 1; i < this.coordinates.length; i++) {
        const prev = this.coordinates[i - 1];
        const curr = this.coordinates[i];
        totalDistance += this.getDistance(prev, curr);
      }

      this.pathInfo = {
        distance: (totalDistance / 1000).toFixed(2), // km로 변환
        duration: Math.round(totalDistance / 1000 * 15) // km당 15분으로 계산
      };
    },

    getDistance(point1, point2) {
      const lat1 = point1.getLat();
      const lon1 = point1.getLng();
      const lat2 = point2.getLat();
      const lon2 = point2.getLng();

      const R = 6371e3; // 지구의 반경 (미터)
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // 미터 단위 거리
    }
  },
  async mounted() {
    try {
      await this.initializeKakaoMap();
      await this.fetchGpxData();
    } catch (error) {
      console.error('지도 초기화 오류:', error);
      this.error = '지도를 불러오는데 실패했습니다.';
    }
  },
  beforeUnmount() {
    if (this.path) {
      this.path.setMap(null);
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  margin: 20px 0;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>