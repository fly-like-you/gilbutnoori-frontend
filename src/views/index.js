// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    isAuthenticated: false,
    places: [], // AppTravel.vue의 places 데이터를 여기로 이동
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    SET_PLACES(state, places) {
      state.places = places;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        // API 호출 로직 구현
        const response = await api.login(credentials);
        commit('SET_USER', response.data.user);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    logout({ commit }) {
      commit('SET_USER', null);
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },
});
