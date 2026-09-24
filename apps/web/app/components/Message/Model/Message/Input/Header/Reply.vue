<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface Props {
  message: MessageEntity;
}

const { message } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const creator = useCreator(() => message);
</script>

<template>
  <MessageModelMessageInputHeader v-if="creator" @close="emit('close')">
    <span truncate
      >Replying to <span text-heading-color>{{ creator.name }}</span></span
    >
  </MessageModelMessageInputHeader>
</template>
