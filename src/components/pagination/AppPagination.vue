<!-- Pagination.vue -->
<template>
  <div class="pagination-wrapper">
    <v-pagination
      v-if="totalPages > 1"
      v-model="currentPageValue"
      :length="totalPages"
      :total-visible="7"
      @update:model-value="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  // 총 페이지 수
  totalPages: {
    type: Number,
    required: true,
  },
  // 현재 페이지
  modelValue: {
    type: Number,
    default: 1,
  },
  // 페이지당 아이템 수
  pageSize: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(["update:modelValue", "page-change"]);

// v-model 구현을 위한 내부 상태
const currentPageValue = ref(props.modelValue);

// 외부 modelValue가 변경될 때 내부 상태 동기화
watch(
  () => props.modelValue,
  (newVal) => {
    currentPageValue.value = newVal;
  }
);

// 페이지 변경 핸들러
const handlePageChange = (page) => {
  currentPageValue.value = page;
  emit("update:modelValue", page);
  emit("page-change", {
    page,
    pageSize: props.pageSize,
  });
};
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
</style>
