// user.js
import { localAxios } from "@/util/http-commons";
import { TOKEN_TYPE, setToken, removeAllTokens } from "@/util/auth";

const local = localAxios();

export const userApi = {
  async signup(userData) {
    const response = await local.post(`/user/signup`, userData);
    return response.data;
  },

  async login(loginData) {
    const response = await local.post(`/user/login`, loginData);
    if (response.data.accessToken && response.data.refreshToken) {
      setToken(TOKEN_TYPE.ACCESS, response.data.accessToken);
      setToken(TOKEN_TYPE.REFRESH, response.data.refreshToken);
    }
    return response.data;
  },

  async logout(userId) {
    const response = await local.get(`/user/logout/${userId}`);
    removeAllTokens();
    return response.data;
  },

  async getUserInfo(userId) {
    const response = await local.get(`/user/info/${userId}`);
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await local.post(`/user/refresh`, { refreshToken });
    if (response.data.accessToken) {
      setToken(TOKEN_TYPE.ACCESS, response.data.accessToken);
    }
    return response.data;
  }
};