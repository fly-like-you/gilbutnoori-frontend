<template>
  <v-container>
    <!-- 날짜 선택 섹션 -->
    <v-card class="mb-6">
      <v-card-title>여행 계획하기</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="selectedDate"
              type="date"
              label="여행 날짜 선택"
              :min="getCurrentDate()"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 둘레길 선택 섹션 -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="selectedRoute"
              :items="mainRoutes"
              label="둘레길 선택"
              item-title="name"
              item-value="id"
              @update:model-value="handleRouteSelect"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="selectedCourse"
              :items="subCourses"
              label="코스 선택"
              item-title="name"
              item-value="id"
              :disabled="!selectedRoute"
              @update:model-value="handleCourseSelect"
              return-object
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    거리: {{ item.raw.dist }}km | 소요시간: {{ formatTime(item.raw.turnaround) }} | 난이도:
                    {{ item.raw.difficulty }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 관광지 목록 섹션 -->
    <v-card v-if="selectedCourse">
      <v-card-title>주변 관광지</v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="attraction in attractions" :key="attraction.id" cols="12" sm="6" md="4">
            <v-card>
              <v-img :src="attraction.firstImage1 || '/default-image.jpg'" height="200" cover></v-img>
              <v-card-title>{{ attraction.title }}</v-card-title>
              <v-card-text>
                <p>{{ attraction.addr1 }} {{ attraction.addr2 }}</p>
                <p>{{ attraction.area }} {{ attraction.gunGu }}</p>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="selectAttraction(attraction)"> 선택하기 </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
const router = useRouter();

// 상태 관리
const selectedDate = ref('');
const selectedRoute = ref(null);
const selectedCourse = ref(null);
const mainRoutes = ref([]);
const subCourses = ref([]);
const attractions = ref([]);

// 현재 날짜 가져오기
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 둘레길 목록 가져오기
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

// 코스 목록 가져오기
const handleRouteSelect = async () => {
  if (!selectedRoute.value) return;
  selectedCourse.value = null;
  attractions.value = [];

  try {
    const response = await axios.get(`http://localhost:8080/courses/search`, {
      params: { routeId: selectedRoute.value },
    });
    if (response.data.isSuccess) {
      subCourses.value = response.data.result.courses.map((course) => ({
        ...course,
        difficulty: getLevelLabel(course.level),
      }));
    }
  } catch (error) {
    console.error('코스 로딩 실패:', error);
  }
};

// 관광지 목록 가져오기
const handleCourseSelect = async (courseId) => {
  if (!courseId) return;
  try {
    const response = await axios.get(`http://localhost:8080/attractions/courses/${courseId}/travelPoint`, {
      params: { contentTypeId: 12 },
    });
    if (response.data.isSuccess) {
      attractions.value = response.data.result.attractions;
    }
  } catch (error) {
    console.error('관광지 로딩 실패:', error);
  }
};
// 레벨별.
const getLevelLabel = (level) => {
  const labels = {
    1: '쉬움',
    2: '보통',
    3: '어려움',
    4: '매우 어려움',
  };
  return labels[level] || '알 수 없음';
};

// 관광지 선택
const selectAttraction = (attraction) => {
  console.log('선택된 관광지:', attraction);
};

// 초기 데이터 로드
onMounted(() => {
  fetchMainRoutes();
});
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}

.attraction-card {
  height: 100%;
}
</style>
