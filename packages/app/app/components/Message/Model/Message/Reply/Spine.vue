<script setup lang="ts">
import { useReplyStore } from "@/store/message/input/reply";

interface ReplySpineProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplySpineProps>();
const replyStore = useReplyStore();
const { isIndicatorActive } = storeToRefs(replyStore);
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <div
    :class="isIndicatorActive ? 'b-text' : 'b-border'"
    h-3
    w-8
    b-solid
    b-l-2
    b-t-2
    rd-tl-2
    cursor-pointer
    transition-border-color
    duration="[var(--transition-duration)]"
    @mouseenter="isIndicatorActive = true"
    @mouseleave="isIndicatorActive = false"
    @click="scrollToMessage(replyRowKey)"
  />
</template>
