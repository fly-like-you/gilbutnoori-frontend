<template>
  <v-container fluid class="pa-0">
    <!-- 상단 코스 타입 캐러셀 -->
    <v-carousel
      v-model="selectedCourseType"
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

      <v-carousel-item v-for="(type, i) in courseTypes" :key="i">
        <div class="d-flex justify-center align-center fill-height">
          <h2 class="text-h4 font-weight-bold">{{ type.title }}</h2>
        </div>
      </v-carousel-item>
    </v-carousel>

    <!-- 하단 코스 카드 목록 -->
    <v-container class="py-8">
      <v-row>
        <v-col cols="12" class="mb-4">
          <h3 class="text-h5 font-weight-bold">{{ currentCourseType.title }}</h3>
        </v-col>
      </v-row>

      <v-slide-group v-model="selectedCard" class="pa-4" selected-class="bg-primary" show-arrows>
        <v-slide-group-item v-for="(course, i) in currentCourseType.courses" :key="i">
          <v-card class="ma-4" width="300" @click="selectCourse(course)">
            <v-img :src="course.image" height="200" cover></v-img>

            <v-card-title>{{ course.title }}</v-card-title>

            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                <span class="text-body-2">{{ course.duration }}</span>
                <v-icon size="small" class="ml-4 mr-1">mdi-map-marker-distance</v-icon>
                <span class="text-body-2">{{ course.distance }}</span>
                <v-icon size="small" class="ml-4 mr-1">mdi-elevation-rise</v-icon>
                <span class="text-body-2">{{ course.difficulty }}</span>
              </div>
              <div class="text-body-2 text-grey">{{ course.description }}</div>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: 'CourseExplorer',

  data() {
    return {
      selectedCourseType: 0,
      selectedCard: null,
      courseTypes: [
        {
          title: '완보코스',
          courses: [
            {
              title: '해파랑길 1코스',
              image: 'https://picsum.photos/id/111/300/200',
              duration: '6시간 30분',
              distance: '16.9km',
              difficulty: '보통',
              description: '부산 오륙도 - 이기대공원',
            },
            {
              title: '해파랑길 2코스',
              image: 'https://picsum.photos/id/112/300/200',
              duration: '5시간',
              distance: '14km',
              difficulty: '쉬움',
              description: '이기대공원 - 광안리해수욕장',
            },
            {
              title: '해파랑길 3코스',
              image: 'https://picsum.photos/id/113/300/200',
              duration: '5시간',
              distance: '16.7km',
              difficulty: '보통',
              description: '광안리해수욕장 - 청사포',
            },
            {
              title: '해파랑길 4코스',
              image: 'https://picsum.photos/id/114/300/200',
              duration: '7시간',
              distance: '19.6km',
              difficulty: '보통',
              description: '청사포 - 송정해수욕장',
            },
            {
              title: '해파랑길 5코스',
              image: 'https://picsum.photos/id/115/300/200',
              duration: '6시간',
              distance: '17.7km',
              difficulty: '쉬움',
              description: '송정해수욕장 - 기장',
            },
          ],
        },
        {
          title: '글로벌추천코스',
          courses: [
            {
              title: '부산 갈맷길 1코스',
              image: 'https://picsum.photos/id/121/300/200',
              duration: '4시간',
              distance: '12.3km',
              difficulty: '쉬움',
              description: '낙동강하구 - 을숙도',
            },
            {
              title: '부산 갈맷길 2코스',
              image: 'https://picsum.photos/id/122/300/200',
              duration: '5시간 30분',
              distance: '15.8km',
              difficulty: '보통',
              description: '을숙도 - 다대포해수욕장',
            },
            {
              title: '제주 올레길 1코스',
              image: 'https://picsum.photos/id/123/300/200',
              duration: '5시간',
              distance: '15km',
              difficulty: '보통',
              description: '시흥초등학교 - 광치기 해변',
            },
            {
              title: '지리산 둘레길 1코스',
              image: 'https://picsum.photos/id/124/300/200',
              duration: '6시간',
              distance: '17km',
              difficulty: '어려움',
              description: '화개장터 - 양전마을',
            },
            {
              title: '설악산 둘레길',
              image: 'https://picsum.photos/id/125/300/200',
              duration: '4시간 30분',
              distance: '13.5km',
              difficulty: '보통',
              description: '설악동 - 오색약수터',
            },
          ],
        },
        {
          title: '추천코스 45선',
          courses: [
            {
              title: '북한산 둘레길 1코스',
              image: 'https://picsum.photos/id/131/300/200',
              duration: '3시간',
              distance: '8.5km',
              difficulty: '쉬움',
              description: '도봉산역 - 솔밭공원',
            },
            {
              title: '남한산성 둘레길',
              image: 'https://picsum.photos/id/132/300/200',
              duration: '4시간',
              distance: '12.7km',
              difficulty: '보통',
              description: '산성역 - 남한산성',
            },
            {
              title: '대전 마을길',
              image: 'https://picsum.photos/id/133/300/200',
              duration: '2시간 30분',
              distance: '7.2km',
              difficulty: '쉬움',
              description: '대전역 - 오월드',
            },
            {
              title: '태안해변길',
              image: 'https://picsum.photos/id/134/300/200',
              duration: '5시간',
              distance: '14.8km',
              difficulty: '보통',
              description: '신두리해변 - 백사장항',
            },
            {
              title: 'DMZ 평화누리길',
              image: 'https://picsum.photos/id/135/300/200',
              duration: '6시간',
              distance: '16.3km',
              difficulty: '어려움',
              description: '임진각 - 초평도',
            },
          ],
        },
      ],
    };
  },

  computed: {
    currentCourseType() {
      return this.courseTypes[this.selectedCourseType];
    },
  },

  methods: {
    selectCourse(course) {
      console.log('Selected course:', course);
    },
  },
};
</script>

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
