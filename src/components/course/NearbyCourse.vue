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
              <v-select v-model="radius" :items="radiusOptions" label="검색 반경"></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn color="primary" block @click="searchNearbyCourses" :loading="loading"> 주변 코스 찾기 </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 지도 -->
      <!-- <div id="map" style="width: 100%; height: 400px;" class="mb-4"></div> -->
      <KakaoMap :lat="coordinate.lat" :lng="coordinate.lng" :draggable="true">
        <KakaoMapMarker :lat="coordinate.lat" :lng="coordinate.lng"></KakaoMapMarker>
      </KakaoMap>
      <!-- 검색된 코스 목록 -->
      <v-row>
        <v-col v-for="course in nearbyCourses" :key="course.id" cols="12" md="6">
          <v-card>
            <v-card-title>{{ course.name }}</v-card-title>
            <v-card-subtitle> 거리: {{ course.distance }}km </v-card-subtitle>
            <v-card-text>
              <p>{{ course.summary }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="primary" @click="viewCourseDetail(course.id)"> 상세보기 </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { KakaoMap, KakaoMapMarker } from "vue3-kakao-maps";
const coordinate = ref({
  lat: 37.566826,
  lng: 126.9786567,
});
</script>

<style scoped>
.nearby-container {
  padding: 20px 0;
}
</style>
