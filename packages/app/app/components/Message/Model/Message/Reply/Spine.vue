<script setup lang="ts">
import { useReplyStore } from "@/store/message/reply";

interface ReplySpineProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplySpineProps>();
const { border, text } = useColors();
const replyStore = useReplyStore();
const { isIndicatorActive } = storeToRefs(replyStore);
const borderColor = computed(() => (isIndicatorActive.value ? text.value : border.value));
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <div
    class="custom-border"
    b-l-2
    b-t-2
    cursor-pointer
    w-8
    h-3
    rd-tl-2
    @mouseenter="isIndicatorActive = true"
    @mouseleave="isIndicatorActive = false"
    @click="scrollToMessage(replyRowKey)"
  />
</template>

<style scoped lang="scss">
.custom-border {
  border: 0 $border-style-root v-bind(borderColor);
  transition: border-color $transition-duration-root;
}
</style>
