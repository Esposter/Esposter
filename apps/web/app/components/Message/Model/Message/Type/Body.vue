<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";

import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { SPOILER_SELECTOR } from "@esposter/shared";

interface Props extends Pick<MessageComponentProps, "isPreview" | "message"> {
  messageHtml: string;
}

defineSlots<{ default?: () => VNode; prepend?: () => VNode }>();
const { isPreview = false, message, messageHtml } = defineProps<Props>();

// A click, Enter or Space on a spoiler reveals it, and again hides it. The attribute lives on the rendered
// Element only, so a re-render of the message clears it
const toggleSpoiler = (event: Event) => {
  if (!(event.target instanceof Element)) return;
  event.target.closest(SPOILER_SELECTOR)?.toggleAttribute("data-revealed");
};
</script>

<template>
  <div flex flex-col gap-y-1>
    <slot name="prepend" />
    <!-- The default slot is the inline editor, which replaces the rendered text while a message is being edited -->
    <slot>
      <div v-if="!EMPTY_TEXT_REGEX.test(messageHtml) || message.isEdited" flex gap-x-1 items-end>
        <div
          v-if="!EMPTY_TEXT_REGEX.test(messageHtml)"
          class="rich-text-content"
          min-w-0
          break-words
          @click="(event) => toggleSpoiler(event)"
          @keydown.enter="(event) => toggleSpoiler(event)"
          @keydown.space.prevent="(event) => toggleSpoiler(event)"
          v-html="messageHtml"
        />
        <span v-if="message.isEdited" text-sm text-muted>(edited)</span>
      </div>
    </slot>
    <MessageModelMessageTypeTrailing :is-preview :message />
  </div>
</template>
