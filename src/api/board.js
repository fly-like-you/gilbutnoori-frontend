import { localAxios } from "@/util/http-commons";
import { getToken, TOKEN_TYPE } from "@/util/auth";

const local = localAxios();

// 게시글 목록 조회
function listArticle(param, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .get(`/boards`, {
      params: param,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

// 게시글 상세 조회
function detailArticle(id, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .get(`/boards/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

// 게시글 등록
function registArticle(article, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);

  console.log("게시글 등록 요청 보낼게요 -> ", article);
  local
    .post(`/boards`, article, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

// 수정할 게시글 조회
function getModifyArticle(id, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .get(`/boards/modify/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

// 게시글 수정
function modifyArticle(article, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .post(`/boards/modify/${article.id}`, article, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

// 게시글 삭제
function deleteArticle(id, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .delete(`/boards/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

function registComment(commentData, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .post(`/comments`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}

function updateCommentApi(commentId, content, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .put(
      `/comments/${commentId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(success)
    .catch(fail);
}
// board.js API 함수
function deleteCommentApi(commentId, success, fail) {
  const token = getToken(TOKEN_TYPE.ACCESS);
  local
    .delete(`/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(success)
    .catch(fail);
}
export {
  listArticle,
  detailArticle,
  registArticle,
  getModifyArticle,
  modifyArticle,
  deleteArticle,
  registComment,
  updateCommentApi,
  deleteCommentApi,
};
