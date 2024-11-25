// api/courseApi.js
import axios from 'axios'

const BASE_URL = 'http://localhost:8080/courses'

export const courseApi = {
  // 코스 검색
  searchCourses: async (criteria, page = 0, size = 20) => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          ...criteria,
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to search courses')
    }
  },

  // 코스 목록 조회
  getCourses: async (params = {}, page = 0, size = 20) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          ...params,
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch courses')
    }
  },

  // 코스 상세 정보 조회
  getCourseDetail: async (courseId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${courseId}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch course details')
    }
  },

  // 코스 지도 데이터 조회
  getCourseMap: async (courseId) => {
    try {
      const response = await axios.post(`${BASE_URL}/map/${courseId}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch course map data')
    }
  }
}