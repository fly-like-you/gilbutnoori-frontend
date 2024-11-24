<template>
  <div class="nearby-container">
    <v-container>
      <!-- 위치 입력 폼 -->
      <v-card class="mb-4">
        <v-card-title>현재 위치 기준 코스 찾기</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="coordinates"
                label="현재 위치"
                readonly
                append-icon="mdi-crosshairs-gps"
                @click:append="getCurrentLocation"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="radius"
                :items="radiusOptions"
                label="검색 반경"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn 
                color="primary" 
                block 
                @click="searchNearbyCourses"
                :loading="loading"
              >
                주변 코스 찾기
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 지도 -->
      <div id="map" style="width: 100%; height: 400px;" class="mb-4"></div>

      <!-- 검색된 코스 목록 -->
      <v-row>
        <v-col v-for="course in nearbyCourses" :key="course.id" cols="12" md="6">
          <v-card>
            <v-card-title>{{ course.name }}</v-card-title>
            <v-card-subtitle>
              거리: {{ course.distance }}km
            </v-card-subtitle>
            <v-card-text>
              <p>{{ course.summary }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="primary"
                @click="viewCourseDetail(course.id)"
              >
                상세보기
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'NearbyCourse',
  data() {
    return {
      map: null,
      markers: [],
      coordinates: '',
      currentLat: 0,
      currentLng: 0,
      radius: 5,
      radiusOptions: [
        { text: '5km', value: 5 },
        { text: '10km', value: 10 },
        { text: '15km', value: 15 },
        { text: '20km', value: 20 }
      ],
      nearbyCourses: [],
      loading: false
    }
  },
  methods: {
    initializeKakaoMap() {
      return new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          this.initMap();
          resolve();
        } else {
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

    async getCurrentLocation() {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        this.currentLat = position.coords.latitude;
        this.currentLng = position.coords.longitude;
        this.coordinates = `${this.currentLat}, ${this.currentLng}`;
        
        // 지도 중심 이동
        const moveLatLon = new window.kakao.maps.LatLng(this.currentLat, this.currentLng);
        this.map.setCenter(moveLatLon);
        
        // 현재 위치 마커 표시
        this.addMarker(moveLatLon, '현재 위치');
      } catch (error) {
        console.error('위치 가져오기 실패:', error);
      }
    },

    async searchNearbyCourses() {
      this.loading = true;
      try {
        const response = await fetch(`http://localhost:8080/courses/nearby?lat=${this.currentLat}&lng=${this.currentLng}&radius=${this.radius}`);
        const data = await response.json();
        
        if (data.isSuccess) {
          this.nearbyCourses = data.result;
          this.showCoursesOnMap();
        }
      } catch (error) {
        console.error('주변 코스 검색 실패:', error);
      } finally {
        this.loading = false;
      }
    },

    addMarker(position, title) {
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: this.map
      });
      
      if (title) {
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">${title}</div>`
        });
        
        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          infowindow.open(this.map, marker);
        });
        
        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.close();
        });
      }
      
      this.markers.push(marker);
    },

    showCoursesOnMap() {
      // 기존 마커 제거
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];
      
      // 새 마커 추가
      this.nearbyCourses.forEach(course => {
        const position = new window.kakao.maps.LatLng(course.latitude, course.longitude);
        this.addMarker(position, course.name);
      });
    },

    viewCourseDetail(courseId) {
      this.$router.push(`/course/${courseId}`);
    }
  },
  async mounted() {
    try {
      await this.initializeKakaoMap();
    } catch (error) {
      console.error('지도 초기화 오류:', error);
    }
  },
  beforeUnmount() {
    this.markers.forEach(marker => marker.setMap(null));
  }
}
</script>

<style scoped>
.nearby-container {
  padding: 20px 0;
}
</style>