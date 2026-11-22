<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";
import { MessageType } from "@esposter/db-schema";

interface Props {
  message: ClientMessage;
}
// What stands in for a message with no text, such as one that only carried a file
defineSlots<{ default?: () => VNode }>();
const { message } = defineProps<Props>();
// Only a body a member or a webhook wrote came through the sanitizer. Every other type is a line the server wrote
// Itself, carrying member names verbatim, so it is shown as text rather than parsed as markup
const isSanitizedHtml = computed(() => message.type === MessageType.Message || message.type === MessageType.Webhook);
</script>

<!-- A message's text cut to one line, as a line quoting or listing it shows it -->
<template>
  <slot v-if="EMPTY_TEXT_REGEX.test(message.message)" />
  <!-- eslint-disable-next-line vue/no-v-html -- a message or webhook body, sanitized at its Zod boundary -->
  <span v-else-if="isSanitizedHtml" class="rich-text-content" max-h-6 min-w-0 truncate v-html="message.message" />
  <span v-else class="rich-text-content" max-h-6 min-w-0 truncate>{{ message.message }}</span>
</template>
