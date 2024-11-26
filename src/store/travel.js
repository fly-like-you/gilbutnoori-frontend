// stores/travel.js
import { defineStore } from "pinia";

export const useCourseStore = defineStore("course", {
  state: () => ({
    selectedCourse: null,
  }),

  actions: {
    setSelectedCourse(course) {
      this.selectedCourse = course;
    },
  },

  getters: {
    getSelectedCourse: (state) => state.selectedCourse,
  },
});
