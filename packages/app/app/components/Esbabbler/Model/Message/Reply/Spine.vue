<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/esbabbler/message";

interface ReplySpineProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplySpineProps>();
const { border, text } = useColors();
const messageStore = useMessageStore();
const { activeReplyRowKey } = storeToRefs(messageStore);
const onClick = () => {
  activeReplyRowKey.value = replyRowKey;
  document.getElementById(replyRowKey)?.scrollIntoView({ behavior: "smooth" });
  useTimeoutFn(() => {
    activeReplyRowKey.value = undefined;
  }, dayjs.duration(2, "seconds").asMilliseconds());
};
</script>

<template>
  <div class="custom-border" b-l-2="!" b-t-2="!" cursor-pointer w-8 h-3 rd-tl-2 @click="onClick" />
</template>

<style scoped lang="scss">
.custom-border {
  border: 0 $border-style-root v-bind(border);
  transition: border-color $transition-duration-root;

  &:hover {
    border-color: v-bind(text);
  }
}
</style>
