<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props extends MessageComponentProps {}

const { isPreview = false } = defineProps<Props>();
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active :is-preview :meaning="UiIconMeaning.Pin" :message>
    <span>{{ creator.name }}</span>
    <span text-muted> pinned </span>
    <UiInlineAction @click="message.replyToId && scrollToMessage(message.roomId, message.replyToId)">
      a message
    </UiInlineAction>
    <span text-muted> to this room.</span>
  </MessageModelMessageTypeSystemLine>
</template>
