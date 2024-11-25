<template>
  <v-container fluid>
    <v-row>
      <!-- 왼쪽 날씨 정보 섹션 -->
      <v-col cols="6">
        <v-card class="weather-section">
          <div class="city-name">
            <h2 class="text-h3 font-weight-bold">{{ selectedCityName }}</h2>
          </div>
          <v-card-text>
            <div v-if="weatherData" class="weather-content">
              <!-- 현재 날씨 -->
              <div class="current-weather">
                <div class="temperature-display">
                  <v-icon size="x-large" class="mr-2">mdi-thermometer</v-icon>
                  <span class="text-h4">{{ formatTemp(weatherData.currentWeather.main.temp) }}</span>
                </div>
                <div class="temp-range">
                  <span>최저: {{ formatTemp(weatherData.currentWeather.main.temp_min) }}</span>
                  <span class="mx-2">|</span>
                  <span>최고: {{ formatTemp(weatherData.currentWeather.main.temp_max) }}</span>
                </div>
              </div>

              <!-- 일별 예보 -->
              <v-divider class="my-4"></v-divider>
              <div class="daily-forecast">
                <h3 class="text-h6 mb-4">5일 예보</h3>
                <v-list>
                  <v-list-item
                    v-for="item in getDailyForecast(weatherData.forecast.list)"
                    :key="item.dt_txt"
                    class="mb-2"
                  >
                    <template v-slot:prepend>
                      <v-icon :color="getWeatherIconColor(item.weather[0].main)">
                        {{ getWeatherIcon(item.weather[0].main) }}
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ formatDate(item.dt_txt) }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatTemp(item.main.temp) }} | 습도: {{ item.main.humidity }}% |
                      {{ item.weather[0].description }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
            <div v-else class="text-center pa-4">
              <p>둘레길과 코스를 선택한 후 날짜를 선택하면 날씨 정보가 표시됩니다.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 오른쪽 여행 계획 섹션 -->
      <v-col cols="6">
        <!-- 둘레길 선택 -->
        <v-card class="mb-4">
          <v-card-title>둘레길 선택</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedRoute"
              :items="mainRoutes"
              label="둘레길"
              item-title="name"
              item-value="id"
              @update:model-value="handleRouteSelect"
              return-object
            ></v-select>
          </v-card-text>
        </v-card>

        <!-- 코스 선택 -->
        <v-card v-if="selectedRoute" class="mb-4">
          <v-card-title>코스 선택</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedCourse"
              :items="courses"
              label="코스"
              item-title="name"
              item-value="id"
              @update:model-value="handleCourseSelect"
              return-object
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    거리: {{ item.raw.dist }}km | 소요시간: {{ formatTime(item.raw.turnaround) }} | 난이도:
                    {{ getLevelLabel(item.raw.level) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-card-text>
        </v-card>

        <!-- 날짜 선택 (둘레길과 코스 선택 후 활성화) -->
        <v-card v-if="selectedRoute && selectedCourse" class="mb-4">
          <v-card-title>여행 날짜 선택</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="selectedDate"
              type="date"
              label="여행 날짜"
              :min="getCurrentDate()"
              :max="getMaxDate()"
              @update:model-value="handleDateSelect"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 상태 관리
const selectedDate = ref('');
const selectedRoute = ref(null);
const selectedCourse = ref(null);
const mainRoutes = ref([]);
const courses = ref([]);
const weatherData = ref(null);
const selectedCityName = ref('');

// 둘레길별 대표 도시 매핑
const routeToCity = {
  T_ROUTE_MNG0000000043: 'busan', // 남파랑길 -> 부산
  T_ROUTE_MNG0000000047: 'changwon', // DMZ 평화의 길 -> 창원
  T_THEME_MNG0000011235: 'ulsan', // 해파랑길 -> 울산
  T_ROUTE_MNG0000000001: 'daejeon', // 서해랑길 -> 대전
};

// 도시 한글명 매핑
const cityKoreanNames = {
  busan: '부산',
  changwon: '창원',
  ulsan: '울산',
  daejeon: '대전',
};

// 현재 날짜 가져오기
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getMaxDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toISOString().split('T')[0];
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
  weatherData.value = null;

  try {
    const response = await axios.get(`http://localhost:8080/courses/search`, {
      params: {
        routeId: selectedRoute.value.id,
      },
    });
    if (response.data.isSuccess) {
      courses.value = response.data.result.courses;
    }
  } catch (error) {
    console.error('코스 로딩 실패:', error);
  }
};

// 날씨 정보 가져오기
const handleDateSelect = async (date) => {
  if (!date || !selectedRoute.value) return;

  try {
    const cityName = routeToCity[selectedRoute.value.id];
    if (!cityName) {
      console.error('Unknown route:', selectedRoute.value.id);
      return;
    }

    const response = await axios.get(`http://localhost:8080/weather/forecast/${cityName}`);
    if (response.data) {
      weatherData.value = response.data;
      selectedCityName.value = cityKoreanNames[cityName];
    }
  } catch (error) {
    console.error('날씨 정보 로딩 실패:', error);
  }
};

// 날짜별 예보 데이터 가공
const getDailyForecast = (forecastList) => {
  const dailyData = {};
  forecastList.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });
  return Object.values(dailyData);
};

// 날씨 아이콘 선택
const getWeatherIcon = (weather) => {
  const icons = {
    Clear: 'mdi-weather-sunny',
    Clouds: 'mdi-weather-cloudy',
    Rain: 'mdi-weather-rainy',
    Snow: 'mdi-weather-snowy',
  };
  return icons[weather] || 'mdi-weather-cloudy';
};

// 날씨 아이콘 색상
const getWeatherIconColor = (weather) => {
  const colors = {
    Clear: 'amber',
    Clouds: 'grey',
    Rain: 'blue',
    Snow: 'light-blue',
  };
  return colors[weather] || 'grey';
};

// 온도 포맷팅
const formatTemp = (temp) => `${Math.round(temp)}°C`;

// 날짜 포맷팅
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

// 시간 포맷팅
const formatTime = (minutes) => {
  if (!minutes) return '정보 없음';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};

// 난이도 레이블
const getLevelLabel = (level) => {
  const labels = {
    1: '쉬움',
    2: '보통',
    3: '어려움',
    4: '매우 어려움',
  };
  return labels[level] || '알 수 없음';
};

// 코스 선택 처리
const handleCourseSelect = async (course) => {
  selectedCourse.value = course;
  weatherData.value = null;
  if (selectedDate.value) {
    await handleDateSelect(selectedDate.value);
  }
};

// 초기 데이터 로드
fetchMainRoutes();
</script>

<style scoped>
.city-name {
  text-align: center;
  padding: 20px;
  background: linear-gradient(to right, #1976d2, #2196f3);
  color: white;
  border-radius: 8px 8px 0 0;
}

.weather-section {
  height: 100%;
  min-height: 500px;
}

.weather-content {
  padding: 20px;
}

.current-weather {
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.temperature-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.temp-range {
  display: flex;
  justify-content: center;
  color: #666;
}

.daily-forecast {
  margin-top: 20px;
}
</style>
