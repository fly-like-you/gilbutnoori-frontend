<!-- ChatbotButton.vue -->
<template>
  <div class="chatbot-container">
    <!-- 채팅창 -->
    <v-dialog
      v-model="isChatOpen"
      :width="500"
      :height="800"
      :fullscreen="$vuetify.display.mobile"
      :transition="$vuetify.display.mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    >
      <v-card class="chat-card">
        <!-- 채팅창 헤더 -->
        <v-toolbar color="primary" density="compact">
          <v-avatar size="32" class="mr-2">
            <v-icon icon="mdi-robot"></v-icon>
          </v-avatar>
          <v-toolbar-title class="text-body-2">둘레길 도우미</v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- 초기화 버튼 추가 -->
          <v-btn icon size="small" class="mr-2" @click="showResetDialog = true" :disabled="messages.length <= 1">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn icon size="small" @click="isChatOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <!-- 채팅 내용 영역 -->
        <v-card-text class="chat-content pa-2">
          <div class="chat-messages" ref="chatMessagesRef">
            <template v-for="(message, index) in messages" :key="index">
              <!-- 날짜 구분선 -->
              <div v-if="showDateDivider(message, index)" class="date-divider">
                {{ formatDate(message.timestamp) }}
              </div>

              <!-- 메시지 아이템 -->
              <div :class="['message', message.isBot ? 'bot-message' : 'user-message']">
                <div class="message-content">
                  {{ message.text }}
                </div>
                <div class="message-time text-caption">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </template>

            <!-- 로딩 애니메이션 -->
            <div v-if="isLoading" class="bot-message loading-message">
              <v-progress-circular indeterminate size="20" width="2" color="primary"></v-progress-circular>
            </div>
          </div>
        </v-card-text>

        <!-- 입력 영역 -->
        <v-card-actions class="chat-input pa-2">
          <v-text-field
            v-model="messageText"
            placeholder="메시지를 입력하세요..."
            variant="outlined"
            density="compact"
            hide-details
            :disabled="isLoading"
            @keyup.enter="sendMessage"
            append-inner-icon="mdi-send"
            @click:append-inner="sendMessage"
          ></v-text-field>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 초기화 확인 대화상자 -->
    <v-dialog v-model="showResetDialog" width="auto">
      <v-card>
        <v-card-title class="text-h6"> 대화 초기화 </v-card-title>
        <v-card-text> 모든 대화 내용이 삭제됩니다. 계속하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showResetDialog = false"> 취소 </v-btn>
          <v-btn color="primary" variant="text" @click="resetChat"> 확인 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 우측 하단 플로팅 버튼 -->
    <v-btn class="chatbot-trigger" color="primary" icon size="large" elevation="4" @click="toggleChat">
      <v-icon>mdi-message</v-icon>
      <!-- 읽지 않은 메시지 배지 -->
      <div v-if="unreadCount > 0" class="unread-badge">
        {{ unreadCount }}
      </div>
    </v-btn>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import axios from "axios";

// 초기화
onMounted(() => {
  loadMessages();
  if (messages.value.length === 0) {
    messages.value.push(initialMessage);
  }
});
// 상태 관리
const showResetDialog = ref(false); // 초기화 대화상자 상태 추가
// 채팅 초기화 함수
const resetChat = () => {
  messages.value = [{ ...initialMessage, timestamp: new Date() }];
  showResetDialog.value = false;
  saveMessages();
  unreadCount.value = 0;
};

// 상태 관리
const isChatOpen = ref(false);
const messageText = ref("");
const messages = ref([]);
const isLoading = ref(false);
const unreadCount = ref(0);
const chatMessagesRef = ref(null);

// 초기 메시지
const initialMessage = {
  text: "안녕하세요! 둘레길 도우미입니다. 무엇을 도와드릴까요?",
  isBot: true,
  timestamp: new Date(),
};

// API 설정
const API_URL = "http://localhost:8080/chatai";

// 초기화
onMounted(() => {
  loadMessages();
  if (messages.value.length === 0) {
    messages.value.push(initialMessage);
  }
});

// 메시지 스크롤 자동 조절
watch(messages, () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
});

// 채팅창 토글
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) {
    unreadCount.value = 0;
  }
};

// API 호출 함수
const fetchBotResponse = async (userInput) => {
  try {
    const response = await axios.post(API_URL, {
      userInput: userInput,
    });
    console.log(response);
    return response.data.result;
  } catch (error) {
    console.error("챗봇 API 호출 중 오류 발생:", error);
    return "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
};

// 메시지 전송
const sendMessage = async () => {
  if (!messageText.value.trim() || isLoading.value) return;

  // 사용자 메시지 추가
  const userMessage = {
    text: messageText.value,
    isBot: false,
    timestamp: new Date(),
  };
  messages.value.push(userMessage);
  messageText.value = "";

  // API 응답 처리
  isLoading.value = true;
  try {
    const botResponse = await fetchBotResponse(userMessage.text);

    const botMessage = {
      text: botResponse,
      isBot: true,
      timestamp: new Date(),
    };

    messages.value.push(botMessage);

    // 메시지 저장
    saveMessages();

    // 채팅창이 닫혀있을 때 읽지 않은 메시지 카운트 증가
    if (!isChatOpen.value) {
      unreadCount.value++;
    }
  } catch (error) {
    const errorMessage = {
      text: "죄송합니다. 응답을 처리하는 중에 오류가 발생했습니다.",
      isBot: true,
      timestamp: new Date(),
    };
    messages.value.push(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// 날짜 포맷팅
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// 날짜 구분선 표시 여부
const showDateDivider = (message, index) => {
  if (index === 0) return true;
  const prevMessage = messages.value[index - 1];
  return !isSameDay(new Date(message.timestamp), new Date(prevMessage.timestamp));
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 로컬 스토리지 관리
const saveMessages = () => {
  localStorage.setItem("chatMessages", JSON.stringify(messages.value));
};

const loadMessages = () => {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages);
  }
};
</script>

<style scoped>
.chatbot-container {
  position: relative;
  z-index: 999;
}

.chatbot-trigger {
  position: fixed !important;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}

.chat-card {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex-grow: 1;
  overflow-y: auto;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
}

.message-content {
  margin-bottom: 4px;
}

.message-time {
  text-align: right;
  opacity: 0.7;
}

.bot-message {
  background-color: #f5f5f5;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.user-message {
  background-color: #e3f2fd;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.date-divider {
  text-align: center;
  margin: 16px 0;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  position: relative;
}

.date-divider::before,
.date-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.date-divider::before {
  left: 0;
}

.date-divider::after {
  right: 0;
}

.loading-message {
  padding: 8px;
  display: flex;
  justify-content: center;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: red;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.chat-input {
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 600px) {
  .chat-card {
    height: 100vh;
  }
}
</style>
