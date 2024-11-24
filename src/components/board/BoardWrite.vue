<template>
  <v-container>
    <v-card class="mx-auto mt-6">
      <v-card-title class="text-h5 mb-2">게시글 작성</v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-text-field
            v-model="article.title"
            label="제목"
            required
            :rules="[v => !!v || '제목을 입력해주세요']"
          ></v-text-field>
          
          <v-textarea
            v-model="article.content"
            label="내용"
            required
            rows="10"
            :rules="[v => !!v || '내용을 입력해주세요']"
          ></v-textarea>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="error" 
              @click="cancelWrite"
            >
              취소
            </v-btn>
            <v-btn 
              color="primary" 
              type="submit"
              :loading="isSubmitting"
            >
              등록
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registArticle } from '@/api/board';

const router = useRouter();
const form = ref(null);
const isSubmitting = ref(false);
const article = ref({
  title: '',
  content: ''
});

const handleSubmit = async () => {
  if (!form.value.validate()) return;
  
  isSubmitting.value = true;
  try {
    registArticle(
      article.value,
      (response) => {
        if (response.data.isSuccess) {
          router.push({ name: 'Board' });
        } else if (response.data.code === 'TOKEN4001') {
          alert('로그인이 필요합니다.');
          router.push('/login');
        } else {
          alert(response.data.message || '게시글 등록에 실패했습니다.');
        }
      },
      (error) => {
        console.error('게시글 등록 실패:', error);
        alert('게시글 등록에 실패했습니다.');
      }
    );
  } finally {
    isSubmitting.value = false;
  }
};

const cancelWrite = () => {
  if (confirm('작성을 취소하시겠습니까?')) {
    router.push({ name: 'Board' });
  }
};
</script>