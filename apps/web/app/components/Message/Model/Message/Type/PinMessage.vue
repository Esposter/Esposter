<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active :is-preview :meaning="UiIconMeaning.Pin" :message>
    <span>{{ creator.name }}</span>
    <span text-muted> pinned </span>
    <UiInlineAction @click="message.replyRowKey && scrollToMessage(message.partitionKey, message.replyRowKey)">
      a message
    </UiInlineAction>
    <span text-muted> to this room.</span>
  </MessageModelMessageTypeSystemLine>
</template>
