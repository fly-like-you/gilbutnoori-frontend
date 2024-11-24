<template>
  <div class="support-container">
    <!-- 관리자 모드 스위치 -->
    <div v-if="isAdmin" class="admin-switch mb-4">
      <v-switch
        v-model="adminMode"
        color="primary"
        label="관리자 모드"
      ></v-switch>
    </div>

    <!-- 관리자 모드 -->
    <div v-if="isAdmin && adminMode">
      <v-card>
        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="faq">FAQ 관리</v-tab>
          <v-tab value="notices">공지사항 관리</v-tab>
          <v-tab value="inquiries">문의내역 관리</v-tab>
        </v-tabs>

        <v-card-text>
          <!-- FAQ 관리 탭 -->
          <v-window v-model="activeTab">
            <v-window-item value="faq">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3>FAQ 목록</h3>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openFaqDialog"
                >
                  FAQ 추가
                </v-btn>
              </div>
              <v-table>
                <thead>
                  <tr>
                    <th>카테고리</th>
                    <th>질문</th>
                    <th>답변</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(faq, index) in faqs" :key="index">
                    <td>{{ faq.category }}</td>
                    <td>{{ faq.question }}</td>
                    <td>{{ faq.answer }}</td>
                    <td>
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        class="mr-2"
                        @click="editFaq(faq)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        @click="deleteFaq(faq)"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>

            <!-- 공지사항 관리 탭 -->
            <v-window-item value="notices">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3>공지사항 목록</h3>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openNoticeDialog"
                >
                  공지사항 추가
                </v-btn>
              </div>
              <v-table>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>작성일</th>
                    <th>중요</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="notice in recentNotices" :key="notice.id">
                    <td>{{ notice.title }}</td>
                    <td>{{ notice.date }}</td>
                    <td>
                      <v-chip color="error" v-if="notice.important"
                        >중요</v-chip
                      >
                    </td>
                    <td>
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        class="mr-2"
                        @click="editNotice(notice)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        @click="deleteNotice(notice)"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>

            <!-- 문의내역 관리 탭 -->
            <v-window-item value="inquiries">
              <h3 class="mb-4">문의내역 관리</h3>
              <v-table>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>상태</th>
                    <th>작성일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inquiry in inquiries" :key="inquiry.id">
                    <td>{{ inquiry.title }}</td>
                    <td>{{ inquiry.author }}</td>
                    <td>
                      <v-chip
                        :color="
                          inquiry.status === '답변완료' ? 'success' : 'warning'
                        "
                      >
                        {{ inquiry.status }}
                      </v-chip>
                    </td>
                    <td>{{ inquiry.date }}</td>
                    <td>
                      <v-btn
                        icon="mdi-reply"
                        size="small"
                        class="mr-2"
                        @click="respondToInquiry(inquiry)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        @click="deleteInquiry(inquiry)"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </div>

    <!-- 일반 사용자 모드 -->
    <div v-else>
      <!-- 상단 검색 섹션 -->
      <v-card class="search-section">
        <h1 class="text-h4 mb-6">고객지원 센터</h1>
        <v-text-field
          v-model="searchQuery"
          placeholder="궁금하신 내용을 검색해보세요"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          class="search-input"
          hide-details
        ></v-text-field>
      </v-card>

      <!-- 주요 카테고리 섹션 -->
      <v-row class="category-section">
        <v-col
          v-for="category in categories"
          :key="category.id"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            class="category-card"
            :class="{ selected: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <v-card-title class="d-flex align-center">
              <v-icon size="24" class="mr-2">{{ category.icon }}</v-icon>
              {{ category.title }}
            </v-card-title>
            <v-card-text>{{ category.description }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- FAQ 섹션 -->
      <v-card class="mt-6" v-if="selectedCategory">
        <v-card-title class="text-h5 pa-4">
          자주 묻는 질문
          <v-chip class="ml-2" color="primary">{{
            getCategoryTitle(selectedCategory)
          }}</v-chip>
        </v-card-title>
        <v-expansion-panels>
          <v-expansion-panel v-for="(faq, index) in filteredFaqs" :key="index">
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-help-circle</v-icon>
                {{ faq.question }}
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              {{ faq.answer }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>

      <!-- 공지사항 섹션 -->
      <v-card class="mt-6">
        <v-card-title class="text-h5"> 공지사항 </v-card-title>
        <v-list>
          <v-list-item
            v-for="notice in recentNotices"
            :key="notice.id"
            :title="notice.title"
            :subtitle="notice.date"
          >
            <template v-slot:prepend>
              <v-icon v-if="notice.important" color="error"
                >mdi-alert-circle</v-icon
              >
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- 1:1 문의하기 섹션 -->
      <v-card class="mt-6 inquiry-section">
        <v-card-title class="text-h5">1:1 문의하기</v-card-title>
        <v-card-text>
          <p class="mb-4">
            원하시는 답변을 찾지 못하셨나요? 개별 문의를 남겨주세요.
          </p>
          <v-btn
            color="primary"
            size="large"
            @click="openInquiryForm"
            prepend-icon="mdi-message-text"
          >
            문의하기
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- 긴급 연락처 섹션 -->
      <v-card class="mt-6 emergency-section" color="error">
        <v-card-title class="text-h6 text-white">
          <v-icon color="white" class="mr-2">mdi-phone-in-talk</v-icon>
          긴급 연락처
        </v-card-title>
        <v-card-text class="text-white">
          <div class="d-flex align-center mb-2">
            <v-icon color="white" class="mr-2">mdi-police-badge</v-icon>
            경찰 긴급신고: 112
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon color="white" class="mr-2">mdi-ambulance</v-icon>
            응급의료센터: 119
          </div>
          <div class="d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-phone</v-icon>
            길벗누리 고객센터: 1588-0000
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- 1:1 문의 다이얼로그 -->
    <v-dialog v-model="showInquiryDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">1:1 문의하기</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="inquiryForm" v-model="isFormValid">
            <v-text-field
              v-model="inquiryForm.title"
              label="제목"
              required
              :rules="[(v) => !!v || '제목을 입력해주세요']"
            ></v-text-field>
            <v-select
              v-model="inquiryForm.category"
              :items="inquiryCategories"
              label="문의 유형"
              required
              :rules="[(v) => !!v || '문의 유형을 선택해주세요']"
            ></v-select>
            <v-textarea
              v-model="inquiryForm.content"
              label="문의 내용"
              required
              :rules="[(v) => !!v || '문의 내용을 입력해주세요']"
            ></v-textarea>
            <v-file-input
              v-model="inquiryForm.files"
              label="첨부파일"
              multiple
              accept="image/*,.pdf"
              prepend-icon="mdi-paperclip"
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeInquiryDialog">
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="submitInquiry"
            :disabled="!isFormValid"
          >
            제출하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "SupportPage",
  setup() {
    const store = useStore();
    const isAdmin = computed(() => store.getters.isAdmin);
    const adminMode = ref(false);
    const activeTab = ref("faq");
    const searchQuery = ref("");
    const selectedCategory = ref(null);
    const showInquiryDialog = ref(false);
    const isFormValid = ref(false);

    // 카테고리 데이터
    const categories = ref([
      {
        id: "guide",
        title: "둘레길 이용 가이드",
        icon: "mdi-map-marker",
        description: "둘레길 이용 방법 및 안내",
      },
      {
        id: "safety",
        title: "안전 여행 수칙",
        icon: "mdi-shield-check",
        description: "안전한 여행을 위한 필수 수칙",
      },
      {
        id: "weather",
        title: "날씨/준비물",
        icon: "mdi-weather-sunny",
        description: "계절별 날씨 및 준비물 안내",
      },
      {
        id: "emergency",
        title: "긴급상황 안내",
        icon: "mdi-alert",
        description: "긴급상황 시 대처방법",
      },
    ]);

    // FAQ 데이터
    const faqs = ref([
      {
        id: 1,
        category: "guide",
        question: "둘레길 이용시간은 어떻게 되나요?",
        answer:
          "둘레길은 24시간 개방되어 있으나, 안전을 위해 일출부터 일몰까지 이용을 권장합니다.",
      },
      {
        id: 2,
        category: "safety",
        question: "혼자서도 둘레길을 이용할 수 있나요?",
        answer:
          "혼자서도 이용 가능하지만, 안전을 위해 가급적 2인 이상 이용을 권장합니다.",
      },
    ]);

    // 공지사항 데이터
    const recentNotices = ref([
      {
        id: 1,
        title: "겨울철 둘레길 안전수칙 안내",
        // script 부분 이어서...
        date: "2024-11-21",
        important: true,
      },
      {
        id: 2,
        title: "둘레길 이용 앱 업데이트 안내",
        date: "2024-11-20",
        important: false,
      },
    ]);

    // 문의내역 데이터
    const inquiries = ref([
      {
        id: 1,
        title: "코스 문의드립니다",
        author: "user123",
        status: "답변대기",
        date: "2024-11-21",
      },
    ]);

    // 문의하기 폼 데이터
    const inquiryForm = ref({
      title: "",
      category: "",
      content: "",
      files: [],
    });

    const inquiryCategories = ["이용문의", "안전문의", "불편신고", "기타문의"];

    // 메서드들
    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId;
    };

    const getCategoryTitle = (categoryId) => {
      const category = categories.value.find((c) => c.id === categoryId);
      return category ? category.title : "";
    };

    const filteredFaqs = computed(() => {
      return faqs.value.filter(
        (faq) => faq.category === selectedCategory.value
      );
    });

    const openInquiryForm = () => {
      showInquiryDialog.value = true;
    };

    const closeInquiryDialog = () => {
      showInquiryDialog.value = false;
      inquiryForm.value = {
        title: "",
        category: "",
        content: "",
        files: [],
      };
    };

    const submitInquiry = async () => {
      // 문의 제출 로직 구현
      try {
        // API 호출 로직이 들어갈 자리
        showInquiryDialog.value = false;
        // 성공 메시지 표시
      } catch (error) {
        console.error("문의 제출 실패:", error);
        // 에러 메시지 표시
      }
    };

    return {
      isAdmin,
      adminMode,
      activeTab,
      searchQuery,
      selectedCategory,
      categories,
      faqs,
      recentNotices,
      inquiries,
      showInquiryDialog,
      isFormValid,
      inquiryForm,
      inquiryCategories,
      selectCategory,
      getCategoryTitle,
      filteredFaqs,
      openInquiryForm,
      closeInquiryDialog,
      submitInquiry,
    };
  },
};
</script>

<style scoped>
.support-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  text-align: center;
  padding: 40px;
  margin-bottom: 30px;
  background: linear-gradient(to right, #4caf50, #81c784);
  color: white;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 4px;
}

.category-section {
  margin-bottom: 30px;
}

.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-card.selected {
  border: 2px solid var(--v-primary-base);
}

.inquiry-section {
  text-align: center;
  padding: 30px;
}

.admin-switch {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 600px) {
  .support-container {
    padding: 10px;
  }

  .search-section {
    padding: 20px;
  }
}
</style>
