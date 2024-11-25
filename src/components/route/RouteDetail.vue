<template>
  <v-container v-if="routeDetail" class="py-8">
    <v-row>
      <v-col cols="12">
        <v-card>
          <!-- Header Section -->
          <v-card-title class="text-h4 pa-4">
            {{ routeDetail.name }}
          </v-card-title>

          <!-- Meta Information -->
          <v-card-subtitle class="pa-4">
            <v-chip class="mr-2" :color="routeDetail.roadOrBike === 'DNWW' ? 'primary' : 'secondary'" size="small">
              {{ routeDetail.roadOrBike === "DNWW" ? "도보여행" : "자전거여행" }}
            </v-chip>
            <span class="text-grey">
              작성일: {{ formatDate(routeDetail.createdAt) }} | 최종 수정일: {{ formatDate(routeDetail.updatedAt) }}
            </span>
          </v-card-subtitle>

          <!-- Summary Section -->
          <v-card-text class="text-h6 pa-4">
            {{ routeDetail.summary }}
          </v-card-text>

          <!-- Divider -->
          <v-divider></v-divider>

          <!-- Detail Content -->
          <v-card-text class="pa-4">
            <div v-html="routeDetail.detail"></div>
          </v-card-text>

          <!-- Actions -->
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="outlined" @click="goBack"> 목록으로 돌아가기 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getRouteDetail } from "@/api/route";

const isLoading = ref(false);

// Router setup
const route = useRoute();
const router = useRouter();

// State management
const routeDetail = ref(null);

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const goBack = () => {
  router.push({
    name: "Home",
  });
};
const fetchRoute = async (routeId) => {
  getRouteDetail(
    routeId,
    (response) => {
      if (response.data.isSuccess) {
        routeDetail.value = response.data.result;
      }
    },
    (error) => {
      console.error("Error fetching routes:", error);
    }
  );
};
// Lifecycle hooks
onMounted(() => {
  const routeId = route.params.id;
  console.log(routeId);
  isLoading.value = true;
  if (routeId) {
    fetchRoute(routeId);
  }
  isLoading.value = false;
});
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

/* Detail content styling */
:deep(.detail-content) {
  line-height: 1.6;
  font-size: 1.1rem;
}

:deep(.detail-content p) {
  margin-bottom: 1rem;
}
</style>
