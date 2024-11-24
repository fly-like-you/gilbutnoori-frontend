<template>
  <v-container fluid class="main-container">
    <!-- 제목 -->
    <v-row justify="center" class="mb-6">
      <h2 class="text-center font-weight-bold">어디로 여행을 떠나시나요?</h2>
    </v-row>

    <!-- 검색 필드 -->
    <v-row justify="center" class="mb-6">
      <v-text-field
        v-model="searchQuery"
        placeholder="국가명이나 도시명으로 검색해보세요."
        append-icon="mdi-magnify"
        outlined
        dense
        class="search-field"
        @input="handleSearch"
      ></v-text-field>
    </v-row>

    <!-- 카테고리 버튼 -->
    <v-row justify="center" class="mb-8">
      <v-btn-toggle v-model="selectedCategory" class="category-toggle" color="primary" mandatory>
        <v-btn value="all">전체</v-btn>
        <v-btn value="domestic">국내</v-btn>
        <v-btn value="international">해외</v-btn>
      </v-btn-toggle>
    </v-row>

    <!-- 여행지 카드 -->
    <v-row justify="center" align="start" class="card-row">
      <v-col v-for="(place, index) in filteredPlaces" :key="index" cols="12" sm="6" md="3" lg="2" class="d-flex">
        <v-card max-width="300" class="place-card" @click="selectPlace(place)" :elevation="4" hover>
          <v-img :src="place.image" height="220px" class="place-image" cover>
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
          <v-card-text class="text-center">
            <h3 class="font-weight-bold mb-1">{{ place.name }}</h3>
            <p class="grey--text">{{ place.country }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 선택된 장소 상세 정보 다이얼로그 -->
    <v-dialog v-model="showPlaceDialog" max-width="600px">
      <v-card v-if="selectedPlace">
        <v-img :src="selectedPlace.image" height="300" cover></v-img>
        <v-card-title>{{ selectedPlace.name }}</v-card-title>
        <v-card-subtitle>{{ selectedPlace.country }}</v-card-subtitle>
        <v-card-text>
          <p>이 도시에 대한 상세 정보가 여기에 표시됩니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showPlaceDialog = false"> 닫기 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
    };
  },
  computed: {
    ...mapGetters(['allPlaces']), // store에서 places 데이터 가져오기
    filteredPlaces() {
      let places = this.allPlaces; // store의 getter 사용

      if (this.selectedCategory !== 'all') {
        places = places.filter((place) => place.category === this.selectedCategory);
      }

      if (!this.searchQuery) return places;

      const query = this.searchQuery.toLowerCase();
      return places.filter(
        (place) => place.name.toLowerCase().includes(query) || place.country.toLowerCase().includes(query)
      );
    },
  },
};
</script>

<style scoped>
.main-container {
  max-width: 1200px;
  padding: 20px;
  margin: auto;
}

.text-center {
  text-align: center;
}

.search-field {
  max-width: 500px;
}

.category-toggle {
  background-color: #f5f5f5;
  border-radius: 10px;
}

.card-row {
  gap: 16px;
}

.place-card {
  width: 100%;
  transition: transform 0.2s;
  cursor: pointer;
}

.place-card:hover {
  transform: translateY(-5px);
}

.place-image {
  border-radius: 8px 8px 0 0;
}
</style>
