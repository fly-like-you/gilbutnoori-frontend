<template>
  <v-container>
    <v-card class="mx-auto mt-6">
      <v-card-title class="text-h5 mb-2">게시글 수정</v-card-title>
      
      <v-card-text>
        <v-form @submit="onSubmit">
          <!-- 읽기 전용 영역 -->
          <v-sheet
            class="pa-4 mb-4"
            color="grey-lighten-4"
            rounded
          >
            <div class="text-subtitle-1 mb-2 text-grey-darken-1">게시글 정보</div>
            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="article.nickname"
                  label="작성자"
                  readonly
                  density="compact"
                  variant="plain"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="article.created_at"
                  label="작성일"
                  readonly
                  density="compact"
                  variant="plain"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="article.hit"
                  label="조회수"
                  readonly
                  density="compact"
                  variant="plain"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-sheet>

          <!-- 수정 가능 영역 -->
          <div class="text-subtitle-1 mb-2 text-primary">수정할 내용</div>
          <v-sheet
            class="pa-4"
            rounded
            border
          >
            <v-text-field
              v-model="article.title"
              label="제목"
              required
              class="mb-4"
              variant="outlined"
              :rules="[v => !!v || '제목을 입력해주세요']"
            ></v-text-field>
            
            <v-textarea
              v-model="article.content"
              label="내용"
              required
              rows="10"
              variant="outlined"
              :rules="[v => !!v || '내용을 입력해주세요']"
            ></v-textarea>
          </v-sheet>

          <v-card-actions class="mt-6">
            <v-spacer></v-spacer>
            <v-btn 
              color="error" 
              variant="outlined"
              @click="cancelModify" 
              class="mr-2"
            >
              취소
            </v-btn>
            <v-btn 
              color="primary" 
              type="submit"
              variant="elevated"
            >
              수정완료
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
/* eslint-disable */
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getModifyArticle, modifyArticle } from '@/api/board';

const route = useRoute();
const router = useRouter();
const article = ref({
  title: '',
  content: '',
  nickname: '',
  created_at: '',
  hit: 0
});

const getArticle = () => {
  const id = route.params.id;
  getModifyArticle(
    id,
    ({ data }) => {
      if (data.isSuccess) {
        article.value = data.result;
      }
    },
    (error) => {
      console.error('게시글 조회 실패:', error);
    }
  );
};

const onSubmit = (e) => {
  e.preventDefault();
  const updateData = {
    id: route.params.id,
    title: article.value.title,
    content: article.value.content
  };

  modifyArticle(
    updateData,
    ({ data }) => {
      if (data.isSuccess) {
        router.push({ name: 'Board' });
      } else {
        alert('게시글 수정에 실패했습니다.');
      }
    },
    (error) => {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    }
  );
};

const cancelModify = () => {
  router.push({
    name: 'article-detail',
    params: { id: route.params.id }
  });
};

onMounted(() => {
  getArticle();
});
</script>