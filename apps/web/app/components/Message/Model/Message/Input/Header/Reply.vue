<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface Props {
  isTopAttached?: boolean;
  message: MessageEntity;
}

const { isTopAttached, message } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const creator = useCreator(() => message);
</script>

<template>
  <MessageModelMessageInputHeader v-if="creator" :is-top-attached @close="emit('close')">
    Replying to <span font-bold>{{ creator.name }}</span>
  </MessageModelMessageInputHeader>
</template>
