<template>
  <!-- 이전 템플릿 코드와 동일 -->
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
          <v-card 
            class="mb-4" 
            :class="{ 'selected-route': selectedRouteId === route.id }"
            @click="selectRoute(route)"
          >
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
          </v-card>
        </v-col>
      </v-row>

      <!-- 선택된 둘레길의 코스 리스트 -->
      <v-dialog
        v-model="showCourses"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn
              icon
              dark
              @click="showCourses = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ selectedRoute?.name }} 코스 목록</v-toolbar-title>
          </v-toolbar>

          <v-container>
            <!-- 코스 로딩 상태 -->
            <div v-if="loadingCourses" class="d-flex justify-center my-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <!-- 코스 목록 -->
            <v-row v-else-if="courses.length > 0">
              <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" lg="4">
                <v-card class="h-100" hover>
                  <v-img
                    height="200"
                    :src="getRandomImage(course.id)"
                    class="bg-grey-lighten-2"
                    cover
                  >
                    <v-chip
                      class="ma-2"
                      :color="getLevelColor(course.level)"
                      label
                      text-color="white"
                    >
                      난이도 {{ course.level }}
                    </v-chip>
                  </v-img>

                  <v-card-title class="text-h6">
                    {{ course.name }}
                  </v-card-title>

                  <v-card-text>
                    <div class="d-flex flex-wrap gap-2 mb-4">
                      <v-chip size="small" color="primary" label>
                        {{ course.dist }}km
                      </v-chip>
                      <v-chip size="small" color="secondary" label>
                        {{ formatTime(course.turnaround) }}
                      </v-chip>
                      <v-chip size="small" label>
                        {{ course.cycle }}
                      </v-chip>
                    </div>

                    <p class="mb-4" v-html="course.summary"></p>

                    <div class="d-flex align-center">
                      <v-icon size="small" color="primary" class="me-1">
                        mdi-map-marker
                      </v-icon>
                      <span class="text-body-2">{{ course.sigun }}</span>
                    </div>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      variant="text"
                      @click="viewCourseDetail(course.id)"
                    >
                      상세 보기
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <!-- 코스가 없을 경우 -->
            <v-alert
              v-else
              type="info"
              class="mt-4"
            >
              현재 등록된 코스가 없습니다.
            </v-alert>

            <!-- 페이지네이션 -->
            <div class="d-flex justify-center mt-6">
              <v-pagination
                v-if="totalPages > 1"
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                @update:model-value="handlePageChange"
              ></v-pagination>
            </div>
          </v-container>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'CourseSearch',
  data() {
    return {
      routes: [],
      loading: false,
      error: null,
      selectedRoute: null,
      selectedRouteId: null,
      showCourses: false,
      courses: [],
      loadingCourses: false,
      currentPage: 1,
      totalPages: 0,
      itemsPerPage: 9
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

    // 수정된 fetchCourses 메소드
    async fetchCourses(page = 1) {
  this.loadingCourses = true;
  try {
    // 선택된 둘레길의 ID를 사용
    const routeId = this.selectedRoute.id;
    console.log("Selected Route ID:", routeId); // 디버깅용

    // CourseSearchCriteria에 맞게 파라미터 구성
    const queryParams = new URLSearchParams({
      routeId: routeId,  // 선택된 둘레길의 ID
      page: page - 1,
      size: this.itemsPerPage,
      sort: 'id,desc'
    });

    const response = await fetch(`http://localhost:8080/courses/search?${queryParams}`);

    if (!response.ok) {
      throw new Error('코스 데이터를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    console.log("API Response:", data); // 디버깅용

    if (data.isSuccess) {
      this.courses = data.result.content;
      this.totalPages = data.result.totalPages;

      if (this.courses.length === 0) {
        this.error = `${this.selectedRoute.name}에 해당하는 코스가 없습니다.`;
      } else {
        this.error = null;
      }
    } else {
      throw new Error(data.message || '데이터 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('코스 API 요청 오류:', error);
    this.error = error.message;
  } finally {
    this.loadingCourses = false;
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

    formatTime(minutes) {
      if (!minutes) return '정보 없음';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}시간 ${mins}분`;
    },

    getLevelColor(level) {
      const colors = {
        1: 'success',
        2: 'info',
        3: 'warning',
        4: 'error'
      };
      return colors[level] || 'grey';
    },

    getRandomImage(id) {
      return `https://picsum.photos/seed/${id}/500/300`;
    },

    selectRoute(route) {
      this.selectedRoute = route;
      this.selectedRouteId = route.id;
      this.showCourses = true;
      this.currentPage = 1;
      this.error = null; // 에러 메시지 초기화
      this.fetchCourses();
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.fetchCourses(page);
    },

    viewCourseDetail(courseId) {
      this.$router.push(`/courses/${courseId}`);
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

.selected-route {
  border: 2px solid var(--v-primary-base);
}

.gap-2 {
  gap: 8px;
}

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>