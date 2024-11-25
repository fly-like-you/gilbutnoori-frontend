// store/member.js
import { ref } from "vue";
import { useRouter } from "vue-router";
import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { localAxios } from "@/util/http-commons";
import { TOKEN_TYPE, setToken, removeAllTokens, getToken } from "@/util/auth";
import { httpStatusCode } from "@/util/http-status";

export const useMemberStore = defineStore("memberStore", () => {
  const router = useRouter();
  const local = localAxios();

  const isLogin = ref(false);
  const isLoginError = ref(false);
  const userInfo = ref(null);
  const isValidToken = ref(false);

  const userSignup = async (signupUser) => {
    try {
      const response = await local.post(`/user/signup`, signupUser);
      if (response.status === httpStatusCode.CREATE) {
        console.log("회원가입 성공!!!!");
        router.push({ name: "Login" });
      }
      return response;
    } catch (error) {
      console.log("회원가입 실패!!!!");
      console.error(error);
      throw error;
    }
  };

  const userLogin = async (loginUser) => {
    try {
      const response = await local.post(`/user/login`, loginUser);
      if (response.status === httpStatusCode.OK || response.status === httpStatusCode.CREATE) {
        const { data } = response;
        setToken(TOKEN_TYPE.ACCESS, data["access-token"]);
        setToken(TOKEN_TYPE.REFRESH, data["refresh-token"]);
        isLogin.value = true;
        isLoginError.value = false;
        isValidToken.value = true;
        
        // 사용자 정보 설정
        if (data.userInfo) {
          userInfo.value = data.userInfo;
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("로그인 실패:", error);
      isLogin.value = false;
      isLoginError.value = true;
      isValidToken.value = false;
      throw error;
    }
  };

  const getUserInfo = async (token) => {
    try {
      const decodeToken = jwtDecode(token);
      const response = await local.get(`/user/info/${decodeToken.userId}`);
      if (response.status === httpStatusCode.OK) {
        userInfo.value = response.data.userInfo;
      }
    } catch (error) {
      console.error("토큰 만료되어 사용 불가능.", error);
      isValidToken.value = false;
      await tokenRegenerate();
    }
  };

  const tokenRegenerate = async () => {
    try {
      const response = await local.post(`/user/refresh`, 
        JSON.stringify(userInfo.value),
        {
          headers: {
            "refreshToken": getToken(TOKEN_TYPE.REFRESH)
          }
        }
      );

      if (response.status === httpStatusCode.CREATE) {
        setToken(TOKEN_TYPE.ACCESS, response.data["access-token"]);
        isValidToken.value = true;
      }
    } catch (error) {
      if (error.response?.status === httpStatusCode.UNAUTHORIZED) {
        try {
          await userLogout();
        } finally {
          alert("RefreshToken 기간 만료!!! 다시 로그인해 주세요.");
          isLogin.value = false;
          userInfo.value = null;
          isValidToken.value = false;
          router.push({ name: "Login" });
        }
      }
    }
  };

  const userLogout = async () => {
    try {
      if (!userInfo.value?.userId) {
        removeAllTokens();
        isLogin.value = false;
        userInfo.value = null;
        isValidToken.value = false;
        return true;
      }
      
      const response = await local.get(`/user/logout/${userInfo.value.userId}`);
      if (response.status === httpStatusCode.OK) {
        removeAllTokens();
        isLogin.value = false;
        userInfo.value = null;
        isValidToken.value = false;
        return true;
      }
      return false;
    } catch (error) {
      removeAllTokens();
      isLogin.value = false;
      userInfo.value = null;
      isValidToken.value = false;
      console.error(error);
      return true;
    }
  };

  const checkLoginState = () => {
    const token = getToken(TOKEN_TYPE.ACCESS);
    if (token) {
      isLogin.value = true;
      return true;
    }
    isLogin.value = false;
    return false;
  };

  return {
    isLogin,
    isLoginError,
    userInfo,
    isValidToken,
    userSignup,
    userLogin,
    getUserInfo,
    tokenRegenerate,
    userLogout,
    checkLoginState
  };
});