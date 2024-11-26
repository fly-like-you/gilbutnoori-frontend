<template>
  <v-card class="weather-section">
    <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 400px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <template v-else>
      <div class="city-name">
        <h2 class="text-h3 font-weight-bold">{{ cityName }}</h2>
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
          <p>날씨 정보를 불러올 수 없습니다.</p>
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Props 정의
const props = defineProps({
  routeId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
});

// 상태 관리
const weatherData = ref(null);
const cityName = ref("");
const isLoading = ref(false);

// 둘레길별 대표 도시 매핑
const routeToCity = {
  T_ROUTE_MNG0000000001: "busan", // 남파랑길
  T_ROUTE_MNG0000000047: "changwon", // DMZ 평화의 길
  T_THEME_MNG0000011235: "ulsan", // 해파랑길
  T_ROUTE_MNG0000000043: "daejeon", // 서해랑길
};

// 도시 한글명 매핑
const cityKoreanNames = {
  busan: "부산",
  changwon: "창원",
  ulsan: "울산",
  daejeon: "대전",
};

// 날씨 정보 가져오기
const fetchWeatherData = async () => {
  isLoading.value = true;
  try {
    const cityCode = routeToCity[props.routeId];
    if (!cityCode) {
      console.error("Unknown route:", props.routeId);
      return;
    }

    const response = await axios.get(`http://localhost:8080/weather/forecast/${cityCode}`);
    if (response.data) {
      weatherData.value = response.data;
      cityName.value = cityKoreanNames[cityCode];
    }
  } catch (error) {
    console.error("날씨 정보 로딩 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

// 날씨 아이콘 선택
const getWeatherIcon = (weather) => {
  const icons = {
    Clear: "mdi-weather-sunny",
    Clouds: "mdi-weather-cloudy",
    Rain: "mdi-weather-rainy",
    Snow: "mdi-weather-snowy",
  };
  return icons[weather] || "mdi-weather-cloudy";
};

// 날씨 아이콘 색상
const getWeatherIconColor = (weather) => {
  const colors = {
    Clear: "amber",
    Clouds: "grey",
    Rain: "blue",
    Snow: "light-blue",
  };
  return colors[weather] || "grey";
};

// 온도 포맷팅
const formatTemp = (temp) => `${Math.round(temp)}°C`;

// 날짜 포맷팅
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

// 날짜별 예보 데이터 가공
const getDailyForecast = (forecastList) => {
  const dailyData = {};
  forecastList.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });
  return Object.values(dailyData);
};

// 컴포넌트 마운트 시 날씨 정보 가져오기
onMounted(() => {
  fetchWeatherData();
});
</script>

<style scoped>
.weather-section {
  height: 100%;
  min-height: 500px;
}

.city-name {
  text-align: center;
  padding: 20px;
  background: linear-gradient(to right, #1976d2, #2196f3);
  color: white;
  border-radius: 8px 8px 0 0;
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
