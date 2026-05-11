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
    b-l-2
    b-t-2
    rd-tl-2
    b-l-solid
    b-t-solid
    h-3
    w-8
    cursor-pointer
    transition-border-color
    duration="[--transition-duration]"
    @mouseenter="isIndicatorActive = true"
    @mouseleave="isIndicatorActive = false"
    @click="scrollToMessage(replyRowKey)"
  />
</template>
