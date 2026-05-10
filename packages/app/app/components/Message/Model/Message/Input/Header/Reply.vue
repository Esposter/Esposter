<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface ReplyProps {
  isTopAttached?: boolean;
  message: MessageEntity;
}

const { isTopAttached, message } = defineProps<ReplyProps>();
const emit = defineEmits<{ close: [] }>();
const creator = useCreator(() => message);
</script>

<template>
  <MessageModelMessageInputHeader v-if="creator" :is-top-attached @close="emit('close')">
    Replying to <span font-bold>{{ creator.name }}</span>
  </MessageModelMessageInputHeader>
</template>
