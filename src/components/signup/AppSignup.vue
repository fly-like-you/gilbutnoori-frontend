<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 text-center position-relative">
      회원가입
      <v-btn icon="mdi-close" size="small" variant="text" @click="close" class="close-button"></v-btn>
    </v-card-title>

    <v-card-text>
      <v-form ref="form" @submit.prevent="handleSignup">
        <!-- 이름 입력 -->
        <v-text-field
          v-model="name"
          label="이름"
          variant="outlined"
          density="compact"
          class="mb-2"
          required
          :disabled="loading"
          :rules="nameRules"
        ></v-text-field>

        <!-- 이메일 입력 -->
        <v-text-field
          v-model="email"
          label="이메일"
          type="email"
          variant="outlined"
          density="compact"
          class="mb-2"
          required
          :disabled="loading"
          :rules="emailRules"
        ></v-text-field>

        <!-- 비밀번호 입력 -->
        <v-text-field
          v-model="password"
          label="비밀번호"
          type="password"
          variant="outlined"
          density="compact"
          class="mb-2"
          required
          :disabled="loading"
          :rules="passwordRules"
          hint="영문, 숫자, 특수문자 포함 8자 이상"
        ></v-text-field>

        <!-- 비밀번호 확인 -->
        <v-text-field
          v-model="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          variant="outlined"
          density="compact"
          class="mb-4"
          required
          :disabled="loading"
          :rules="[...passwordRules, passwordConfirmRule]"
        ></v-text-field>

        <!-- 약관 동의 -->
        <v-checkbox v-model="agreeToTerms" class="mb-4" density="compact" :disabled="loading">
          <template v-slot:label>
            <div class="text-caption">
              <router-link to="/terms" class="text-primary" @click="openTerms">이용약관</router-link> 및
              <router-link to="/privacy" class="text-primary" @click="openPrivacy">개인정보처리방침</router-link>에
              동의합니다.
            </div>
          </template>
        </v-checkbox>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-btn type="submit" block color="primary" :loading="loading" :disabled="loading || !agreeToTerms" class="mb-4">
          회원가입
        </v-btn>

        <div class="text-center text-body-2">
          <p class="mb-2">
            이미 계정이 있으신가요?
            <v-btn variant="text" color="primary" size="small" @click="goToLogin" :disabled="loading">
              로그인하기
            </v-btn>
          </p>
        </div>
      </v-form>
    </v-card-text>

    <!-- 약관 다이얼로그 -->
    <v-dialog v-model="termsDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ dialogType === 'terms' ? '이용약관' : '개인정보처리방침' }}
        </v-card-title>
        <v-card-text class="pa-4">
          {{ dialogType === 'terms' ? termsContent : privacyContent }}
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="termsDialog = false"> 확인 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { ref, inject } from 'vue';
import { mapActions } from 'vuex';

export default {
  setup() {
    const form = ref(null);
    const showSnackbar = inject('showSnackbar');

    return {
      form,
      showSnackbar,
    };
  },

  data() {
    return {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      agreeToTerms: false,
      loading: false,
      error: null,
      termsDialog: false,
      dialogType: 'terms',
      termsContent: '이용약관 내용이 들어갑니다...',
      privacyContent: '개인정보처리방침 내용이 들어갑니다...',

      nameRules: [(v) => !!v || '이름을 입력해주세요.', (v) => v.length >= 2 || '이름은 2자 이상이어야 합니다.'],
      emailRules: [
        (v) => !!v || '이메일을 입력해주세요.',
        (v) => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다.',
      ],
      passwordRules: [
        (v) => !!v || '비밀번호를 입력해주세요.',
        (v) => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다.',
        (v) =>
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/.test(v) ||
          '영문, 숫자, 특수문자를 포함해야 합니다.',
      ],
    };
  },

  computed: {
    passwordConfirmRule() {
      return (v) => v === this.password || '비밀번호가 일치하지 않습니다.';
    },
  },

  methods: {
    ...mapActions(['signup']),

    close() {
      this.$emit('close');
    },

    async handleSignup() {
      if (!this.form?.validate()) return;

      this.loading = true;
      this.error = null;

      try {
        await this.signup({
          name: this.name,
          email: this.email,
          password: this.password,
        });

        this.close();
        this.$router.push('/');
        this.showSnackbar({
          text: '회원가입이 완료되었습니다.',
          color: 'success',
        });
      } catch (err) {
        this.error = '회원가입 중 오류가 발생했습니다.';
        this.showSnackbar({
          text: '회원가입 중 오류가 발생했습니다.',
          color: 'error',
        });
      } finally {
        this.loading = false;
      }
    },

    goToLogin() {
      this.$emit('switch-to-login');
    },

    openTerms(e) {
      e.preventDefault();
      this.dialogType = 'terms';
      this.termsDialog = true;
    },

    openPrivacy(e) {
      e.preventDefault();
      this.dialogType = 'privacy';
      this.termsDialog = true;
    },
  },
};
</script>

<style scoped>
.close-button {
  position: absolute;
  right: 8px;
  top: 8px;
}

.position-relative {
  position: relative;
}
</style>
