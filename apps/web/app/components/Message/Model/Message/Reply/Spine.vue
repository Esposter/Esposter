<script setup lang="ts">
import { useReplyStore } from "@/store/message/input/reply";

interface Props {
  replyRowKey: string;
  roomId: string;
}

const { replyRowKey, roomId } = defineProps<Props>();
const replyStore = useReplyStore();
const { isIndicatorActive } = storeToRefs(replyStore);
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <div
    class="spine"
    :class="isIndicatorActive ? 'b-text' : 'b-divider'"
    b-l-2
    b-t-2
    rd-tl-2
    b-l-solid
    b-t-solid
    h-3
    w-8
    cursor-pointer
    @mouseenter="isIndicatorActive = true"
    @mouseleave="isIndicatorActive = false"
    @click="scrollToMessage(roomId, replyRowKey)"
  />
</template>

<style scoped>
.spine {
  transition: border-color var(--ui-motion-short);
}
</style>
