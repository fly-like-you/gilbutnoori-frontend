import { jwtDecode } from "jwt-decode";

// 토큰 타입 상수 정의
export const TOKEN_TYPE = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'userInfo'  // 사용자 정보를 위한 키 추가
};

// 토큰 가져오기
export const getToken = (type) => {
  return sessionStorage.getItem(type);
};

// 토큰 저장
export const setToken = (type, token) => {
  sessionStorage.setItem(type, token);
};

// 특정 토큰 삭제
export const removeToken = (type) => {
  sessionStorage.removeItem(type);
};

// 모든 토큰 삭제
export const removeAllTokens = () => {
  removeToken(TOKEN_TYPE.ACCESS);
  removeToken(TOKEN_TYPE.REFRESH);
  removeToken(TOKEN_TYPE.USER);
};

// JWT 토큰 디코드
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

// 토큰 유효성 검사
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// 사용자 정보 저장
export const setUserInfo = (userInfo) => {
  sessionStorage.setItem(TOKEN_TYPE.USER, JSON.stringify(userInfo));
};

// 사용자 정보 가져오기
export const getUserInfo = () => {
  const userInfo = sessionStorage.getItem(TOKEN_TYPE.USER);
  try {
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

// 로그인 상태 확인
export const isLoggedIn = () => {
  const accessToken = getToken(TOKEN_TYPE.ACCESS);
  return isTokenValid(accessToken);
};

// 로그아웃 처리
export const logout = () => {
  removeAllTokens();
};

// Authorization 헤더 생성
export const getAuthHeader = () => {
  const accessToken = getToken(TOKEN_TYPE.ACCESS);
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

// 권한 확인
export const checkUserPermission = (requiredRole) => {
  const userInfo = getUserInfo();
  return userInfo?.role === requiredRole;
};

// 토큰 갱신이 필요한지 확인
export const needTokenRefresh = () => {
  const accessToken = getToken(TOKEN_TYPE.ACCESS);
  if (!accessToken) return true;

  try {
    const decoded = decodeToken(accessToken);
    if (!decoded) return true;

    // 만료 10분 전에 갱신
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < 600;
  } catch (error) {
    console.error('Token refresh check error:', error);
    return true;
  }
};

// 에러 메시지 처리
export const handleAuthError = (error) => {
  let message = '인증 처리 중 오류가 발생했습니다.';
  
  if (error.response) {
    switch (error.response.status) {
      case 401:
        message = '인증이 만료되었습니다. 다시 로그인해주세요.';
        break;
      case 403:
        message = '접근 권한이 없습니다.';
        break;
      default:
        message = error.response.data?.message || message;
    }
  }
  
  return { error: true, message };
};

// 초기 인증 상태 설정
export const initializeAuth = () => {
  const accessToken = getToken(TOKEN_TYPE.ACCESS);
  const userInfo = getUserInfo();
  
  return {
    isAuthenticated: isTokenValid(accessToken),
    userInfo: userInfo,
    hasValidToken: !!accessToken
  };
};