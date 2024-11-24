<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-6">게시판</h2>

        <!-- 검색 및 필터링 -->
        <v-row class="mb-4">
          <v-col cols="12" sm="4">
            <v-select 
              v-model="param.searchType"
              :items="searchTypes"
              label="검색 유형"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="8" class="d-flex">
            <v-text-field
              v-model="param.searchQuery"
              label="검색어를 입력하세요"
              append-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              @keyup.enter="handleSearch"
            ></v-text-field>
            <v-btn 
              color="primary" 
              class="ml-2" 
              @click="handleSearch"
              :disabled="!param.searchQuery"
            >
              검색
            </v-btn>
          </v-col>
        </v-row>

        <!-- 로딩 상태 -->
        <v-progress-linear
          v-if="isLoading"
          indeterminate
          color="primary"
        ></v-progress-linear>

        <!-- 게시글 목록 -->
        <template v-if="!isLoading">
          <v-table v-if="articles && articles.length > 0">
            <thead>
              <tr>
                <th class="text-center">번호</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th class="text-center">조회수</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="article in articles"
                :key="article.id"
                @click="viewArticle(article.id)"
                style="cursor: pointer"
                class="post-row"
              >
                <td class="text-center">{{ article.id }}</td>
                <td>{{ article.title }}</td>
                <td>{{ article.nickname }}</td>
                <td>{{ article.created_at }}</td>
                <td class="text-center">{{ article.hit }}</td>
              </tr>
            </tbody>
          </v-table>

          <!-- 검색 결과가 없을 때 -->
          <v-alert
            v-else
            type="info"
            class="mt-4"
          >
            게시글이 없습니다.
          </v-alert>
        </template>

        <!-- 페이지네이션 -->
        <div v-if="articles && articles.length > 0" class="d-flex justify-center mt-6">
          <v-pagination
            v-model="param.page"
            :length="totalPages"
            :total-visible="7"
            @update:model-value="getArticles"
            rounded="circle"
          ></v-pagination>
        </div>

        <!-- 글쓰기 버튼 -->
        <v-btn 
          color="primary" 
          class="mt-4" 
          prepend-icon="mdi-pencil" 
          @click="moveWrite"
        >
          글쓰기
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { listArticle } from '@/api/board';

const router = useRouter();
const articles = ref([]);  // 빈 배열로 초기화
const totalPages = ref(1);
const totalElements = ref(0);
const isLoading = ref(false);  // 로딩 상태 추가

const param = ref({
  page: 0,
  size: 10,
  sort: 'id,desc',
  searchType: 'title',
  searchQuery: ''
});

const searchTypes = [
  { title: '제목', value: 'title' },
  { title: '작성자', value: 'nickname' },
  { title: '내용', value: 'content' }
];

const getArticles = () => {
  isLoading.value = true;  // 로딩 시작
  listArticle(
    {
      page: param.value.page,
      size: param.value.size,
      sort: param.value.sort,
      searchType: param.value.searchType,
      searchQuery: param.value.searchQuery
    },
    (response) => {
      if (response.data?.isSuccess) {
        articles.value = response.data.result.articles || [];
        totalPages.value = response.data.result.totalPages || 1;
        totalElements.value = response.data.result.totalElements || 0;
      } else if (response.data?.code === 'TOKEN4001') {
        alert('로그인이 필요합니다.');
        router.push('/login');
      } else {
        articles.value = [];
        alert('게시글 목록을 불러오는데 실패했습니다.');
      }
      isLoading.value = false;  // 로딩 완료
    },
    (error) => {
      console.error('게시글 목록 조회 실패:', error);
      articles.value = [];
      alert('게시글 목록을 불러오는데 실패했습니다.');
      isLoading.value = false;  // 로딩 완료
    }
  );
};

const handleSearch = () => {
  param.value.page = 0;
  getArticles();
};

const viewArticle = (id) => {
  router.push({
    name: 'article-detail',
    params: { id }
  });
};

const moveWrite = () => {
  router.push({ name: 'article-write' });
};

onMounted(() => {
  getArticles();
});
</script>

<style scoped>
.post-row:hover {
  background-color: #f5f5f5;
}
</style>