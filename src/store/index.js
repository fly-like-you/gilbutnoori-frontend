import { createStore } from "vuex";

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    isAuthenticated: !!localStorage.getItem("user"),
    userRole: localStorage.getItem("userRole") || "USER",
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      state.userRole = user?.role || "USER";
      if (user) {
        localStorage.setItem("userRole", state.userRole);
      } else {
        localStorage.removeItem("userRole");
      }
    },
  },
  actions: {
    login({ commit }, credentials) {
      // 테스트용 하드코딩된 로그인
      const users = {
        ssafy: {
          loginId: "ssafy",
          name: "SSAFY User",
          role: "USER",
        },
        admin: {
          loginId: "admin",
          name: "Admin User",
          role: "ADMIN",
        },
      };

      if (users[credentials.loginId] && credentials.password === "123456") {
        const user = users[credentials.loginId];
        localStorage.setItem("user", JSON.stringify(user));
        commit("SET_USER", user);
        return Promise.resolve(user);
      }
      return Promise.reject("Invalid credentials");
    },

    logout({ commit }) {
      return new Promise((resolve) => {
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        commit("SET_USER", null);
        resolve();
      });
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.userRole === "ADMIN",
    userRole: (state) => state.userRole,
  },
});
