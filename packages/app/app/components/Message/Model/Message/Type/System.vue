<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface SystemProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, isPreview = false, message } = defineProps<SystemProps>();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active icon="mdi-information-outline" :is-preview :message>
    <span italic op-medium-emphasis>{{ message.message }}</span>
  </MessageModelMessageTypeSystemLine>
</template>
