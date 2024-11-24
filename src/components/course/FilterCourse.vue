<template>
  <div>
    <select v-model="selectedLevel" @change="filterCourses">
      <option value="1">초급</option>
      <option value="2">중급</option>
      <option value="3">고급</option>
    </select>

    <ul>
      <li v-for="course in filteredCourses" :key="course.id">
        <h3>{{ course.name }}</h3>
        <p>{{ course.summary }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedLevel: 1,
      courses: [],
      filteredCourses: []
    };
  },
  methods: {
    async filterCourses() {
      const response = await fetch(`/courses/search?level=${this.selectedLevel}`);
      const data = await response.json();
      this.filteredCourses = data.result.content;
    }
  },
  created() {
    this.filterCourses();
  }
};
</script>
