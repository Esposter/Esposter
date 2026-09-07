<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";

import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props extends Pick<MessageComponentProps, "isPreview" | "message"> {
  messageHtml: string;
}

defineSlots<{ default?: () => VNode; prepend?: () => VNode }>();
const { isPreview = false, message, messageHtml } = defineProps<Props>();
</script>

<template>
  <div flex flex-col gap-y-1>
    <slot name="prepend" />
    <!-- The default slot is the inline editor, which replaces the rendered text while a message is being edited -->
    <slot>
      <div v-if="!EMPTY_TEXT_REGEX.test(messageHtml) || message.isEdited" flex gap-x-1 items-end>
        <v-list-item-subtitle
          v-if="!EMPTY_TEXT_REGEX.test(messageHtml)"
          class="rich-text-content"
          op-100
          v-html="messageHtml"
        />
        <span v-if="message.isEdited" text-2.4 line-height-3.2 op-medium-emphasis>(edited)</span>
      </div>
    </slot>
    <MessageModelMessageTypeTrailing :is-preview :message />
  </div>
</template>
