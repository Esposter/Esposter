<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface ReplyProps {
  isTopAttached?: boolean;
  reply: MessageEntity;
}

const { isTopAttached, reply } = defineProps<ReplyProps>();
const emit = defineEmits<{ close: [] }>();
const creator = useCreator(() => reply);
</script>

<template>
  <MessageModelMessageInputHeader v-if="creator" :is-top-attached @close="emit('close')">
    Replying to <span font-bold>{{ creator.name }}</span>
  </MessageModelMessageInputHeader>
</template>
