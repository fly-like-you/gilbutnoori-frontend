<template>
  <v-container class="stats-section py-12">
    <v-row justify="center" align="center" class="text-center">
      <v-col cols="12" md="4">
        <div class="text-h3 font-weight-bold primary--text mb-2">212,279</div>
        <div class="text-subtitle-1 grey--text">실시간 둘레길 완주자 수</div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="text-h3 font-weight-bold primary--text mb-2">96</div>
        <div class="text-subtitle-1 grey--text"></div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="text-h3 font-weight-bold primary--text mb-2">98%</div>
        <div class="text-subtitle-1 grey--text">사용자 만족도</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'StatusSection',
};
</script>

<style scoped>
.stats-section {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
