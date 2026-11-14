<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

interface Props {
  message: ClientMessage;
}

const { message } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const creator = useCreator(() => message);
</script>

<template>
  <MessageModelMessageInputHeader v-if="creator" @close="emit('close')">
    <span truncate>Replying to <span text-heading-color>{{ creator.name }}</span></span>
  </MessageModelMessageInputHeader>
</template>
