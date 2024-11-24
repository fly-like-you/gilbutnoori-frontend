<template>
  <div>
    <h2>즐겨찾기한 코스</h2>
    <ul v-if="favorites.length">
      <li v-for="course in favorites" :key="course.id">
        <h3>{{ course.name }}</h3>
        <p>{{ course.description }}</p>
        <button @click="removeFavorite(course.id)">즐겨찾기 삭제</button>
      </li>
    </ul>
    <p v-else>즐겨찾기한 코스가 없습니다.</p>
  </div>
</template>

<script>
export default {
  name: 'FavoriteCourse',
  data() {
    return {
      favorites: []
    }
  },
  methods: {
    async removeFavorite(id) {
      try {
        // API 호출하여 즐겨찾기 삭제
        await fetch(`/api/favorites/${id}`, {
          method: 'DELETE'
        });
        // 목록에서 제거
        this.favorites = this.favorites.filter(course => course.id !== id);
      } catch (error) {
        console.error('즐겨찾기 삭제 실패:', error);
      }
    }
  },
  async created() {
    try {
      // 즐겨찾기 목록 가져오기
      const response = await fetch('/api/favorites');
      const data = await response.json();
      this.favorites = data;
    } catch (error) {
      console.error('즐겨찾기 목록 로드 실패:', error);
    }
  }
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #cc0000;
}
</style>