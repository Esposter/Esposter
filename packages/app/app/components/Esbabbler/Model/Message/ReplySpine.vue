<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/esbabbler/message";

interface ReplySpineProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplySpineProps>();
const { border, text } = useColors();
const messageStore = useMessageStore();
const { activeReply, messageList } = storeToRefs(messageStore);
const reply = computed(() => messageList.value.find(({ rowKey }) => rowKey === replyRowKey));
const { start: resetActiveReply } = useTimeoutFn(() => {
  activeReply.value = undefined;
}, dayjs.duration(2, "seconds").asMilliseconds());
</script>

<template>
  <div
    class="custom-border"
    b-l-2="!"
    b-t-2="!"
    w-8
    h-2
    rd-tl-1
    cursor-pointer
    @click="
      () => {
        activeReply = reply;
        resetActiveReply();
      }
    "
  />
</template>

<style scoped lang="scss">
.custom-border {
  border: 0px $border-style-root v-bind(border);
  transition: border-color 0.25s;

  &:hover {
    border-color: v-bind(text);
  }
}
</style>
