// src/main.js
// vue 애플리케이션의 진입점으로, 주요설정과 플러그인들을 초기화 하는 곳.
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import './assets/pretendardvariable.css'

loadFonts();

const app = createApp(App);
const pinia = createPinia();  // Pinia 인스턴스 생성

app
  .use(pinia)  // Pinia 추가
  .use(store)
  .use(router)
  .use(vuetify)
  .mount('#app');