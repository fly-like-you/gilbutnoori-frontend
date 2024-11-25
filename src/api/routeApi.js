// api/courseApi.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/routes";

export const routeApi = {
  // 코스 검색
  getRoute: async (routeId) => {
    try {
      const response = await axios.get(`${BASE_URL}`, {
        params: {
          routeId,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to search courses");
    }
  },

  // 코스 목록 조회
  getRoutes: async (page = 0, size = 20) => {
    try {
      const response = await axios.get(BASE_URL, {
        page,
        size,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch courses");
    }
  },
};
