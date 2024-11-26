// .eslintrc.js
module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: false,
      jsx: false,
    },
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-undef": "off", // defineProps, defineEmits가 전역임을 인정
  },

  globals: {
    kakao: true,
    defineProps: "readonly", // defineProps를 전역으로 등록
    defineEmits: "readonly", // defineEmits를 전역으로 등록
  },
};
