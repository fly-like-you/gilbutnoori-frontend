<template>
  <v-container>
    <v-card class="mx-auto mt-6">
      <v-card-title class="text-h5 mb-2">{{ article.title }}</v-card-title>
      
      <v-card-subtitle>
        <div class="d-flex align-center">
          <span>작성자: {{ article.nickname }}</span>
          <v-spacer></v-spacer>
          <span>조회수: {{ article.hit }}</span>
          <span class="ml-4">작성일: {{ article.created_at }}</span>
        </div>
      </v-card-subtitle>

      <v-divider></v-divider>

      <v-card-text class="mt-4">
        <div class="text-body-1">{{ article.content }}</div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="moveList">목록으로</v-btn>
        <v-btn 
          v-if="isAuthor"
          color="warning" 
          class="ml-2" 
          @click="moveModify"
        >
          수정
        </v-btn>
        <v-btn 
          v-if="isAuthor" 
          color="error" 
          class="ml-2" 
          @click="onDeleteArticle"
        >
          삭제
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { detailArticle, deleteArticle } from '@/api/board';

const route = useRoute();
const router = useRouter();
const article = ref({});

// 로그인 사용자와 게시글 작성자 일치 여부 확인
const isAuthor = computed(() => {
  try {
    const loginUser = localStorage.getItem('user');
    if (!loginUser) return false;
    
    const user = JSON.parse(loginUser);
    return article.value.loginId === user.loginId;
  } catch (error) {
    console.error('사용자 권한 확인 실패:', error);
    return false;
  }
});

const getArticle = () => {
  const id = route.params.id;
  detailArticle(
    id,
    ({ data }) => {
      if (data.isSuccess) {
        article.value = data.result;
      } else if (data.code === 'TOKEN4001') {
        alert('로그인이 필요합니다.');
        router.push('/login');
      } else {
        alert(data.message || '게시글을 불러오는데 실패했습니다.');
      }
    },
    (error) => {
      console.error('게시글 조회 실패:', error);
      alert('게시글 조회에 실패했습니다.');
      router.push({ name: 'Board' });
    }
  );
};

const moveList = () => {
  router.push({ name: 'Board' });
};

const moveModify = () => {
  if (!isAuthor.value) {
    alert('게시글 수정 권한이 없습니다.');
    return;
  }
  router.push({ 
    name: 'article-modify', 
    params: { id: route.params.id } 
  });
};

const onDeleteArticle = () => {
  if (!isAuthor.value) {
    alert('게시글 삭제 권한이 없습니다.');
    return;
  }

  if (confirm('정말 삭제하시겠습니까?')) {
    deleteArticle(
      route.params.id,
      ({ data }) => {
        if (data.isSuccess) {
          router.push({ name: 'Board' });
        } else {
          alert('게시글 삭제에 실패했습니다.');
        }
      },
      (error) => {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    );
  }
};

onMounted(() => {
  getArticle();
});
</script>