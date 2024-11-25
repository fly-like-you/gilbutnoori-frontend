<script setup>
import { ref, onMounted } from "vue";
import { listRoutes } from "@/api/route";
import { useRouter } from "vue-router";

const router = useRouter();

// 상태 관리
const routes = ref([]);
const selectedRoute = ref(null);

// API 요청 함수
const fetchRoutes = async () => {
  listRoutes(
    (response) => {
      if (response.data.isSuccess) {
        routes.value = response.data.result.routes;
      }
    },
    (error) => {
      console.error("Error fetching routes:", error);
    }
  );
};

// 유틸리티 함수들
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ko-KR");
};

const getRouteImage = (routeId) => {
  // 실제 이미지 URL을 반환하는 로직으로 수정 필요
  return `https://picsum.photos/200/300?random=${routeId}`;
};

const selectRoute = (route) => {
  selectedRoute.value = route;
  console.log(route);
  router.push({
    name: "RouteDetail",
    params: { id: route.id },
  });
  // 필요한 경우 라우터를 통한 상세 페이지 이동 로직 추가
};

// 생명주기 훅
onMounted(() => {
  fetchRoutes();
});
</script>

<template>
  <div>
    <v-carousel
      v-model="selectedRouteType"
      :show-arrows="true"
      hide-delimiter-background
      height="100"
      hide-delimiters
      class="course-type-carousel"
    >
      <template v-slot:prev="{ props }">
        <v-btn variant="plain" color="primary" v-bind="props" icon="mdi-chevron-left" size="large"></v-btn>
      </template>
      <template v-slot:next="{ props }">
        <v-btn variant="plain" color="primary" v-bind="props" icon="mdi-chevron-right" size="large"></v-btn>
      </template>

      <v-carousel-item v-for="(type, i) in routeTypes" :key="i">
        <div class="d-flex justify-center align-center fill-height">
          <h2 class="text-h4 font-weight-bold">{{ type.title }}</h2>
        </div>
      </v-carousel-item>
    </v-carousel>

    <v-container class="py-8">
      <v-row>
        <v-col cols="12" class="mb-4">
          <h3 class="text-h5 font-weight-bold">국내 도보여행길 목록</h3>
        </v-col>
      </v-row>
      <v-slide-group v-model="selectedRoute" class="pa-4" selected-class="bg-primary" show-arrows>
        <v-slide-group-item v-for="route in routes" :key="route.id">
          <v-card class="ma-4" width="300" @click="selectRoute(route)">
            <v-img :src="getRouteImage(route.id)" height="200" cover></v-img>
            <v-card-title>{{ route.name }}</v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" class="mr-1">mdi-map-marker-path</v-icon>
                <span class="text-body-2">도보여행</span>
                <v-icon size="small" class="ml-4 mr-1">mdi-calendar</v-icon>
                <span class="text-body-2">{{ formatDate(route.createdAt) }}</span>
              </div>
              <div class="text-body-2 text-grey">{{ route.summary }}</div>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-container>
  </div>
</template>

<style scoped>
.course-type-carousel {
  background-color: #f5f5f5;
}

.course-type-carousel :deep(.v-carousel__controls) {
  display: none;
}

.v-slide-group {
  background-color: transparent;
}
</style>
