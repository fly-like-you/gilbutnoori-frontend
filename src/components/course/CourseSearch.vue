<template>
  <div class="routes-container">
    <v-container>
      <!-- 로딩 상태 표시 -->
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <!-- 에러 메시지 -->
      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
      >
        {{ error }}
      </v-alert>

      <!-- 둘레길 목록 -->
      <v-row>
        <v-col v-for="route in routes" :key="route.id" cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title class="text-h6">
              {{ route.name }}
            </v-card-title>
            
            <v-card-subtitle>
              {{ route.summary }}
            </v-card-subtitle>

            <v-card-text>
              <div class="route-info">
                <div class="mb-2">
                  <v-chip
                    :color="route.roadOrBike === 'DNWW' ? 'success' : 'info'"
                    small
                  >
                    {{ route.roadOrBike === 'DNWW' ? '도보' : '자전거' }}
                  </v-chip>
                </div>
                <div class="text-caption">
                  생성일: {{ formatDate(route.createdAt) }}
                </div>
                <div class="text-caption">
                  수정일: {{ formatDate(route.updatedAt) }}
                </div>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="primary"
                text
                @click="showDetail(route)"
              >
                상세 정보 보기
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 상세 정보 다이얼로그 -->
      <v-dialog
        v-model="detailDialog"
        max-width="600"
      >
        <v-card v-if="selectedRoute">
          <v-card-title>
            {{ selectedRoute.name }}
          </v-card-title>
          <v-card-text>
            <div v-html="selectedRoute.detail"></div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="detailDialog = false"
            >
              닫기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'FavoriteCourse',
  data() {
    return {
      routes: [],
      loading: false,
      error: null,
      detailDialog: false,
      selectedRoute: null
    }
  },
  methods: {
    async fetchRoutes() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('http://localhost:8080/routes');
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        if (data.isSuccess && data.code === 'COMMON200') {
          this.routes = data.result.content;
        } else {
          throw new Error(data.message || '데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('API 요청 오류:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    },
    
    showDetail(route) {
      this.selectedRoute = route;
      this.detailDialog = true;
    }
  },
  created() {
    this.fetchRoutes();
  }
}
</script>

<style scoped>
.routes-container {
  padding: 20px 0;
}

.route-info {
  margin-top: 12px;
}

.text-caption {
  color: rgba(0, 0, 0, 0.6);
}
</style>