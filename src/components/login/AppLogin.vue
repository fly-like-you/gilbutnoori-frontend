  <template>
    <v-card class="pa-4">
      <v-card-title class="text-h5 text-center position-relative">
        로그인
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="close"
          class="close-button"
        ></v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleLogin">
          <v-text-field
            v-model="formData.loginId"
            label="아이디"
            variant="outlined"
            density="compact"
            class="mb-2"
            required
            :disabled="loading"
            :rules="[(v) => !!v || '아이디를 입력해주세요.']"
          ></v-text-field>

          <v-text-field
            v-model="formData.password"
            label="비밀번호"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-4"
            required
            :disabled="loading"
            :rules="[(v) => !!v || '비밀번호를 입력해주세요.']"
          ></v-text-field>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <v-btn
            type="submit"
            block
            color="primary"
            :loading="loading"
            :disabled="loading"
            class="mb-4"
          >
            로그인
          </v-btn>

          <div class="text-center text-body-2">
            <div class="mb-2">
              계정이 없으신가요?
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="goToSignup"
                :disabled="loading"
              >
                회원가입
              </v-btn>
            </div>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="goToForgotPassword"
              :disabled="loading"
            >
              비밀번호 찾기
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </template>

  <script setup>
  import { ref, inject } from 'vue';
  import { useRouter } from 'vue-router';
  import { useMemberStore } from '@/store/member';

  const router = useRouter();
  const memberStore = useMemberStore();
  const showSnackbar = inject('showSnackbar');

  const form = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const formData = ref({
    loginId: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!form.value?.validate()) return;

    loading.value = true;
    error.value = null;

    try {
      const success = await memberStore.userLogin({
        loginId: formData.value.loginId,
        password: formData.value.password,
      });

      if (success) {
        showSnackbar({
          text: '로그인되었습니다.',
          color: 'success',
        });
        router.push('/');
      }
    } catch (err) {
      error.value = err.message || '로그인에 실패했습니다.';
      showSnackbar({
        text: error.value,
        color: 'error',
      });
    } finally {
      loading.value = false;
    }
  };

  const close = () => {
    router.push('/');
  };

  const goToSignup = () => {
    router.push('/signup');
  };

  const goToForgotPassword = () => {
    router.push('/forgot-password');
  };
  </script>

  <style scoped>
  .v-card {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .v-text-field {
    margin-bottom: 15px;
  }

  .v-btn {
    text-transform: none;
    letter-spacing: 0;
  }

  .close-button {
    position: absolute;
    right: 8px;
    top: 8px;
  }

  .position-relative {
    position: relative;
  }

  /* 모바일 대응 */
  @media (max-width: 600px) {
    .v-card {
      margin: 15px;
      padding: 15px;
    }
  }
  </style>