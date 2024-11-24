<template>
  <div>
    <h2>추천 코스</h2>
    <ul>
      <li v-for="course in recommendedCourses" :key="course.id">
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
      recommendedCourses: []
    };
  },
  async created() {
    const response = await fetch('/courses/recommended');
    const data = await response.json();
    this.recommendedCourses = data.result.content;
  }
};
</script>
