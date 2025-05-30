<script setup lang="ts">
import { useEsbabblerStore } from "@/store/esbabbler";
import { useReplyStore } from "@/store/esbabbler/reply";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface ReplyProps {
  rowKey: string;
}

const { rowKey } = defineProps<ReplyProps>();
const { text } = useColors();
const esbabblerStore = useEsbabblerStore();
const { userMap } = storeToRefs(esbabblerStore);
const replyStore = useReplyStore();
const { onIndicatorClick } = replyStore;
const { isIndicatorActive, replyMap } = storeToRefs(replyStore);
const reply = computed(() => replyMap.value.get(rowKey));
const creator = computed(() => (reply.value ? userMap.value.get(reply.value.userId) : undefined));
const color = computed(() => (isIndicatorActive.value ? text.value : "gray"));
</script>

<template>
  <div flex items-center gap-x-1>
    <template v-if="reply && creator">
      <StyledAvatar :image="creator.image" :name="creator.name" :avatar-props="{ size: 'x-small' }" />
      <div flex items-center gap-x-1>
        <span text-xs text-gray font-bold>{{ creator.name }}</span>
        <v-icon v-if="reply.isForward" icon="mdi-share" size="small" />
        <span v-if="!EMPTY_TEXT_REGEX.test(reply.message)" text-xs v-html="reply.message" />
        <span
          v-else
          :style="{ color }"
          text-xs
          italic
          cursor-pointer
          @mouseenter="isIndicatorActive = true"
          @mouseleave="isIndicatorActive = false"
          @click="onIndicatorClick(reply.rowKey)"
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
