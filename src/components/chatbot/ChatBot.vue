<!-- Chatbot.vue -->
<template>
  <div class="chatbot-container">
    <!-- 챗봇 토글 버튼 -->
    <v-btn
      class="chatbot-toggle"
      icon="mdi-message-text"
      color="primary"
      size="large"
      elevation="3"
      @click="toggleChat"
      :class="{ 'is-active': isChatOpen }"
    ></v-btn>

    <!-- 챗봇 대화창 -->
    <v-card v-show="isChatOpen" class="chatbot-window" width="350" height="500" elevation="4">
      <v-card-title class="chat-header">
        <span>채팅 상담</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" size="small" variant="text" @click="toggleChat"></v-btn>
      </v-card-title>

      <!-- 메시지 표시 영역 -->
      <v-card-text class="chat-messages" ref="messageContainer">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
          <v-card
            :class="['message-bubble', message.type]"
            variant="tonal"
            :color="message.type === 'bot' ? 'primary' : 'grey-lighten-3'"
          >
            <v-card-text>
              {{ message.content }}
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <!-- 메시지 입력 영역 -->
      <v-card-actions class="chat-input">
        <v-text-field
          v-model="newMessage"
          placeholder="메시지를 입력하세요..."
          variant="outlined"
          density="compact"
          hide-details
          @keyup.enter="sendMessage"
        >
          <template v-slot:append>
            <v-btn icon="mdi-send" color="primary" variant="text" @click="sendMessage"></v-btn>
          </template>
        </v-text-field>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import axios from "axios";

const isChatOpen = ref(false);
const messages = ref([]);
const newMessage = ref("");
const messageContainer = ref(null);

// 채팅창 토글 함수
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

// 메시지 전송 함수
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  // 사용자 메시지 추가
  messages.value.push({
    type: "user",
    content: newMessage.value,
  });

  try {
    // API 호출
    const response = await axios.post("{{url}}/plans/busan/10", {
      message: newMessage.value,
    });

    // 봇 응답 추가
    messages.value.push({
      type: "bot",
      content: response.data.message,
    });
  } catch (error) {
    messages.value.push({
      type: "bot",
      content: "죄송합니다. 오류가 발생했습니다.",
    });
  }

  newMessage.value = "";
  scrollToBottom();
};

// 스크롤을 항상 최신 메시지로 이동
const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 메시지가 추가될 때마다 스크롤 조정
watch(messages, () => {
  scrollToBottom();
});
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chatbot-toggle {
  position: absolute;
  bottom: 0;
  right: 0;
}

.chatbot-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  border-bottom: 1px solid #e0e0e0;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message.user {
  align-items: flex-end;
}

.message.bot {
  align-items: flex-start;
}

.message-bubble {
  max-width: 80%;
  border-radius: 12px;
}

.chat-input {
  border-top: 1px solid #e0e0e0;
  padding: 8px;
}
</style>
