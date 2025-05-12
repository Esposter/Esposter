<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

interface ReplySpineProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplySpineProps>();
const { border, text } = useColors();
const messageStore = useMessageStore();
const { onReplyIndicatorClick } = messageStore;
const { isReplyIndicatorActive } = storeToRefs(messageStore);
const borderColor = computed(() => (isReplyIndicatorActive.value ? text.value : border.value));
</script>

<template>
  <div
    class="custom-border"
    b-l-2="!"
    b-t-2="!"
    cursor-pointer
    w-8
    h-3
    rd-tl-2
    @mouseenter="isReplyIndicatorActive = true"
    @mouseleave="isReplyIndicatorActive = false"
    @click="onReplyIndicatorClick(replyRowKey)"
  />
</template>

<style scoped lang="scss">
.custom-border {
  border: 0 $border-style-root v-bind(borderColor);
  transition: border-color $transition-duration-root;
}
</style>
