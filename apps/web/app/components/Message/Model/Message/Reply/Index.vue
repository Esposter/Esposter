<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useReplyStore } from "@/store/message/input/reply";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { MessageType } from "@esposter/db-schema";

interface Props {
  roomId: string;
  rowKey: string;
}

const { roomId, rowKey } = defineProps<Props>();
const replyStore = useReplyStore();
const { isIndicatorActive } = storeToRefs(replyStore);
const { getReplyMapRef } = replyStore;
// The replied message's own room, never the one on screen: the thread pane renders a room beside whichever is open
const replyMap = getReplyMapRef(() => roomId);
const reply = computed(() => replyMap.value.get(rowKey));
const creator = useCreator(reply);
const scrollToMessage = useScrollToMessage();
</script>

<!-- The message a reply answers, in one line over it: its author, and its text or what it carried -->
<template>
  <div text-sm text-muted flex gap-x-1 min-w-0 items-center>
    <template v-if="reply && creator">
      <UiAvatar :image="creator.image ?? ''" :name="creator.name" is-small />
      <MessageModelMessageAppUserBadge v-if="reply.type === MessageType.Webhook" />
      <span text-heading-color shrink-0>{{ creator.name }}</span>
      <span v-if="reply.isForward" class="i-mdi:share" aria-label="Forwarded" role="img" shrink-0 size-6 />
      <span
        v-if="!EMPTY_TEXT_REGEX.test(reply.message)"
        class="rich-text-content"
        max-h-6
        min-w-0
        truncate
        v-html="reply.message"
      />
      <button
        v-else
        :class="isIndicatorActive ? 'text-text' : 'text-muted'"
        type="button"
        cursor-pointer
        italic
        @mouseenter="isIndicatorActive = true"
        @mouseleave="isIndicatorActive = false"
        @click="scrollToMessage(reply.partitionKey, reply.rowKey)"
      >
        Click to see attachment
      </button>
      <span v-if="reply.files.length > 0" class="i-mdi:file-image" aria-label="Attachment" role="img" shrink-0 size-6 />
    </template>
    <template v-else>
      <UiIcon :meaning="UiIconMeaning.Reply" />
      <span italic>Original message was deleted</span>
    </template>
  </div>
</template>
