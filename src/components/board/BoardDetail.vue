<template>
  <v-container fluid>
    <v-row>
      <!-- Left side - Travel Plans -->
      <v-col cols="12" :md="sortedPlans.length ? 5 : 0">
        <v-card v-if="sortedPlans.length">
          <v-card-title class="text-h5">여행 일정</v-card-title>
          <v-timeline>
            <v-timeline-item v-for="plan in sortedPlans" :key="plan.id" size="small">
              <template v-if="plan.attraction">
                <v-card class="course-card">
                  <v-img
                    v-if="plan.attraction.firstImage1"
                    :src="plan.attraction.firstImage1"
                    height="200"
                  ></v-img>
                  <v-card-title>{{ plan?.attraction?.title }}</v-card-title>
                  <div class="d-flex align-center">
                    <v-icon size="small" color="primary" class="me-1"> mdi-map-marker </v-icon>
                    <span class="text-body-2">{{ plan.attraction.addr1 }}</span>
                  </div>
                </v-card>
              </template>
              <template v-else-if="plan.course">
                <v-card class="course-card">
                  <v-card-title>{{ plan.course.name }}</v-card-title>
                  <v-card-text>
                    <div>거리: {{ plan.course.dist }}km</div>
                    <div>소요시간: {{ plan.course.turnaround }}분</div>
                    <div>난이도: {{ plan.course.level }}</div>
                  </v-card-text>
                </v-card>
              </template>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>

      <!-- Right side - Post Details -->
      <v-col :cols="12" :md="sortedPlans.length ? 7 : 6" :offset-md="sortedPlans.length ? 0 : 3">
        <v-card>
          <v-card-title class="text-h4">{{ article.title }}</v-card-title>
          <v-card-subtitle>
            작성자: {{ article.nickname }} | 조회수: {{ article.hit }} | 작성일:
            {{ article.created_at }}

            <!-- Edit Post Button -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="goToEdit">수정하기</v-btn>
            </v-card-actions>
          </v-card-subtitle>

          <v-card-text>{{ article.content }}</v-card-text>

          <!-- Post Images -->
          <v-row class="ma-2">
            <v-col v-for="file in article.fileInfos" :key="file.id" cols="12" sm="6" md="4">
              <v-img :src="getImageUrl(file.id)" height="200" cover></v-img>
            </v-col>
          </v-row>

          <!-- Comments Section -->
          <v-card-text class="comment">
            <v-divider class="my-4"></v-divider>
            <h3 class="text-h6 mb-4">댓글</h3>
            <v-list v-if="article?.comments?.comments">
              <v-list-item v-for="comment in article.comments.comments" :key="comment.id">
                <v-row align="center" no-gutters>
                  <v-col v-if="editingComment !== comment.id">
                    <div class="d-flex align-center">
                      <div>
                        <v-list-item-title>{{ comment.nickname }}</v-list-item-title>
                        <v-list-item-subtitle>{{ comment.content }}</v-list-item-subtitle>
                      </div>
                      <v-spacer></v-spacer>
                      <div v-if="isCommentOwner(comment)">
                        <v-btn-group density="compact">
                          <v-btn icon size="small" @click="startEdit(comment)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon size="small" color="error" @click="confirmDelete(comment.id)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-btn-group>
                      </div>
                    </div>
                  </v-col>
                  <v-col v-else>
                    <!-- 수정 폼 부분 -->
                    <v-text-field
                      v-model="editedContent"
                      @keyup.enter="updateComment(comment.id)"
                      append-icon="mdi-check"
                      @click:append="updateComment(comment.id)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>

          <!-- 댓글 작성 폼 -->
          <v-form @submit.prevent="submitComment" class="mb-4 px-4">
            <v-text-field
              v-model="newComment"
              label="댓글 작성"
              append-inner-icon="mdi-send"
              @click:append-inner="submitComment"
              density="compact"
            ></v-text-field>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-title>댓글 삭제</v-card-title>
        <v-card-text>정말로 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="deleteComment">삭제</v-btn>
          <v-btn @click="deleteDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { detailArticle, registComment, updateCommentApi, deleteCommentApi } from "@/api/board";

const article = ref({});
const plans = ref([]);
const router = useRouter();
const route = useRoute();

const deleteDialog = ref(false);
const editingComment = ref(null);
const editedContent = ref("");
const commentToDelete = ref(null);

// Sort plans by sequence
const sortedPlans = computed(() => {
  return plans.value ? [...plans.value].sort((a, b) => a.sequence - b.sequence) : [];
});

// Comment owner check
const isCommentOwner = (comment) => {
  return comment.nickname !== article.value.nickname;
};

// Edit comment functions
const startEdit = (comment) => {
  editingComment.value = comment.id;
  editedContent.value = comment.content;
};

// 컴포넌트에서의 사용:
const updateComment = async (commentId) => {
  try {
    await updateCommentApi(
      commentId,
      editedContent.value,
      () => {
        editingComment.value = null;
        editedContent.value = "";
        getArticle(); // 댓글 목록 새로고침
      },
      (error) => console.error("댓글 수정 실패:", error)
    );
  } catch (error) {
    console.error("댓글 수정 실패:", error);
  }
};
const newComment = ref("");

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  const commentData = {
    boardId: article.value.id,
    content: newComment.value,
  };

  await registComment(
    commentData,
    ({ data }) => {
      if (data.isSuccess) {
        getArticle(); // 댓글 목록 새로고침
        newComment.value = ""; // 입력창 초기화
      }
    },
    (error) => {
      console.error("댓글 등록 실패:", error);
    }
  );
};

// Delete comment functions
const confirmDelete = (commentId) => {
  commentToDelete.value = commentId;
  deleteDialog.value = true;
};

// 컴포넌트에서의 사용
const deleteComment = async () => {
  try {
    await deleteCommentApi(
      commentToDelete.value,
      () => {
        deleteDialog.value = false;
        commentToDelete.value = null;
        getArticle();
      },
      (error) => console.error("댓글 삭제 실패:", error)
    );
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
  }
};
const getImageUrl = (fileId) => {
  return `http://localhost:8080/files/${fileId}`;
};
// Navigation
const goToEdit = () => {
  router.push(`/board/edit/${article.value.id}`);
};

const getArticle = async () => {
  const id = route.params.id;
  detailArticle(
    id,
    ({ data }) => {
      if (data.isSuccess) {
        console.log(data);
        article.value = data.result;
        plans.value = data.result.travel?.plans?.planResult;
      } else {
        alert(data.message || "게시글을 불러오는데 실패했습니다.");
      }
    },
    (error) => {
      console.error("게시글 조회 실패:", error);
      alert("게시글 조회에 실패했습니다.");
      router.push({ name: "BoardList" });
    }
  );
};

onMounted(() => {
  getArticle();
});
</script>
<style scoped>
.course-card {
  max-height: 300px;
}
.v-timeline {
  height: calc(100vh - 120px); /* 상단 여백을 고려한 높이 */
  overflow-y: scroll;
  padding-right: 16px; /* 스크롤바 공간 확보 */
}

.v-card {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.v-card-title {
  flex: 0 0 auto;
}
.comment {
  overflow-y: scroll;
}
.comment-item {
  margin: 10px;
  padding: 10px;
}
</style>
