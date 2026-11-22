<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useReplyStore } from "#src/store/message/input/reply";
import { MessageType } from "@esposter/db-schema";

interface Props {
  messageId: number;
  roomId: string;
}

const { messageId, roomId } = defineProps<Props>();
const replyStore = useReplyStore();
const { isIndicatorActive } = storeToRefs(replyStore);
const { getReplyMapRef } = replyStore;
// The replied message's own room, never the one on screen: the thread pane renders a room beside whichever is open
const replyMap = getReplyMapRef(() => roomId);
const reply = computed(() => replyMap.value.get(messageId));
const creator = useCreator(reply);
const scrollToMessage = useScrollToMessage();
</script>

<!-- The message a reply answers, in one line over it: its author, and its text or what it carried -->
<template>
  <div text-sm text-muted flex gap-x-1 min-w-0 items-center>
    <template v-if="reply && creator">
      <UiAvatar :image="creator.image" :name="creator.name" is-small />
      <MessageModelMessageAppUserBadge v-if="reply.type === MessageType.Webhook" />
      <span text-heading-color shrink-0>{{ creator.name }}</span>
      <UiIcon v-if="reply.isForward" :meaning="UiIconMeaning.Forward" label="Forwarded" />
      <MessageModelMessageSnippet :message="reply">
        <button
          :class="isIndicatorActive ? 'text-text' : 'text-muted'"
          type="button"
          cursor-pointer
          italic
          @mouseenter="isIndicatorActive = true"
          @mouseleave="isIndicatorActive = false"
          @click="scrollToMessage(reply.roomId, reply.id)"
        >
          Click to see attachment
        </button>
      </MessageModelMessageSnippet>
      <UiIcon v-if="reply.files.length > 0" :meaning="UiIconMeaning.Image" label="Attachment" />
    </template>
    <template v-else>
      <UiIcon :meaning="UiIconMeaning.Reply" />
      <span italic>Original message was deleted</span>
    </template>
  </div>
</template>
