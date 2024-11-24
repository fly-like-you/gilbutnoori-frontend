<template>
  <v-footer app color="grey-lighten-3" class="footer-container">
    <v-container class="py-2">
      <v-row justify="space-between" align="start" class="py-1">
        <!-- 회사 정보 섹션 -->
        <v-col cols="12" md="4" class="py-1">
          <div class="d-flex align-center">
            <h3 class="text-subtitle-1 font-weight-bold mr-4">두루누비</h3>
            <div class="social-icons">
              <v-btn
                v-for="(icon, index) in socialIcons"
                :key="index"
                icon
                :href="icon.link"
                target="_blank"
                density="compact"
                size="small"
                variant="text"
                color="grey-darken-1"
              >
                <v-icon size="18">{{ icon.icon }}</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- 빠른 링크 섹션 -->
        <v-col cols="12" md="4" class="py-1 d-flex align-center">
          <v-list density="compact" class="bg-transparent pa-0 d-flex flex-row">
            <v-list-item v-for="(link, index) in quickLinks" :key="index" :to="link.to" class="px-2" density="compact">
              <template v-slot:prepend>
                <v-icon size="small" color="grey-darken-1">
                  {{ link.icon }}
                </v-icon>
              </template>
              <v-list-item-title class="text-caption text-grey-darken-1">
                {{ link.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- 고객 지원 섹션 -->
        <v-col cols="12" md="4" class="py-1 text-right">
          <div class="text-caption d-flex justify-end align-center">
            <div class="mr-4">
              <v-icon size="small" color="grey-darken-1" class="mr-1">mdi-phone</v-icon>
              010-8019-8764
            </div>
            <div>부울경 4반 김동현, 박준호</div>
          </div>
        </v-col>
      </v-row>

      <!-- 저작권 정보 -->
      <v-divider class="my-1"></v-divider>
      <div class="text-center text-caption text-grey-darken-1 py-1">
        <span>&copy; {{ new Date().getFullYear() }} 두루누비. All rights reserved.</span>
        <template v-if="legalLinks.length">
          <span class="mx-2">|</span>
          <router-link
            v-for="(link, index) in legalLinks"
            :key="index"
            :to="link.to"
            class="text-decoration-none text-grey-darken-1 mx-2"
          >
            {{ link.title }}
          </router-link>
        </template>
      </div>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      socialIcons: [
        { icon: 'mdi-facebook', link: 'https://facebook.com' },
        { icon: 'mdi-twitter', link: 'https://twitter.com' },
        { icon: 'mdi-instagram', link: 'https://instagram.com' },
      ],
      quickLinks: [
        { title: '여행 후기', to: '/reviews', icon: 'mdi-comment' },
        { title: '이용 가이드', to: '/guide', icon: 'mdi-book-open-variant' },
      ],
      legalLinks: [
        { title: '이용약관', to: '/terms' },
        { title: '개인정보처리방침', to: '/privacy' },
      ],
    };
  },
};
</script>

<style scoped>
.footer-container {
  min-height: auto !important;
  position: relative;
  bottom: 0;
  width: 100%;
}

.v-list-item {
  min-height: 32px !important;
  height: 32px;
}

.social-icons {
  display: flex;
  gap: 4px;
}

.v-btn.v-btn--icon {
  transition: transform 0.2s;
}

@media (max-width: 600px) {
  .v-footer {
    padding: 4px 0;
  }

  .text-center {
    text-align: left !important;
  }
}
</style>
