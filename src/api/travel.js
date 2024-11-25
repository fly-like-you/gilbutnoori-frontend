import { localAxios } from "@/util/http-commons";
import { getToken, TOKEN_TYPE } from "@/util/auth";
const local = localAxios();

// 게시글 목록 조회
function listTravels(success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .get(`/travels`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}
export { listTravels };
