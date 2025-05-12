<script setup lang="ts">
import { useEsbabblerStore } from "@/store/esbabbler";
import { useMessageStore } from "@/store/esbabbler/message";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface ReplyProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplyProps>();
const { text } = useColors();
const esbabblerStore = useEsbabblerStore();
const { userMap } = storeToRefs(esbabblerStore);
const messageStore = useMessageStore();
const { onReplyIndicatorClick } = messageStore;
const { isReplyIndicatorActive, replyMap } = storeToRefs(messageStore);
const reply = computed(() => replyMap.value.get(replyRowKey));
const creator = computed(() => (reply.value ? userMap.value.get(reply.value.userId) : undefined));
const color = computed(() => (isReplyIndicatorActive.value ? text.value : "gray"));
</script>

<template>
  <div flex items-center gap-1>
    <template v-if="reply && creator">
      <StyledAvatar :image="creator.image" :name="creator.name" :avatar-props="{ size: 'x-small' }" />
      <div flex items-center gap-1>
        <span text-xs text-gray font-bold>{{ creator.name }}</span>
        <v-icon v-if="reply.isForward" icon="mdi-share" size="small" />
        <span v-if="!EMPTY_TEXT_REGEX.test(reply.message)" text-xs v-html="reply.message" />
        <span
          v-else
          :style="{ color }"
          text-xs
          italic
          cursor-pointer
          @mouseenter="isReplyIndicatorActive = true"
          @mouseleave="isReplyIndicatorActive = false"
          @click="onReplyIndicatorClick(reply.rowKey)"
        >
          Click to see attachment
        </span>
        <v-icon v-if="reply.files.length > 0" icon="mdi-file-image" size="small" />
      </div>
    </template>
    <template v-else>
      <v-icon pb-0.75 size="x-small" icon="mdi-reply" />
      <span pb-0.75 text-xs italic>Original message was deleted</span>
    </template>
  </div>
</template>
