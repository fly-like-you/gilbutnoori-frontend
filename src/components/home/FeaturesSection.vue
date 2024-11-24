<template>
  <v-container class="features-section py-12 grey lighten-4">
    <v-row justify="center" class="text-center mb-12">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold mb-3">특별한 기능</h2>
        <p class="text-subtitle-1 grey--text">AI가 제안하는 최적의 여행 일정을 경험해보세요</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="(feature, index) in features" :key="index" cols="12" md="4">
        <v-card class="feature-card mx-auto" flat>
          <v-icon size="48" color="primary" class="mb-4">
            {{ feature.icon }}
          </v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
          <p class="grey--text">{{ feature.description }}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'FeaturesSection',
  data() {
    return {
      features: [
        {
          icon: 'mdi-rocket-launch',
          title: 'AI 기반 일정 생성',
          description: '인공지능이 당신의 선호도를 분석하여 최적의 여행 일정을 제안합니다.',
        },
        {
          icon: 'mdi-map-marker',
          title: '스마트 경로 추천',
          description: '효율적인 동선을 고려한 최적의 여행 경로를 제안합니다.',
        },
        {
          icon: 'mdi-account-group',
          title: '실시간 리뷰',
          description: '다른 여행자들의 실제 경험을 바탕으로 한 추천을 받아보세요.',
        },
      ],
    };
  },
};
</script>

<style scoped>
.feature-card {
  padding: 32px;
  text-align: center;
  transition: transform 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}
</style>
