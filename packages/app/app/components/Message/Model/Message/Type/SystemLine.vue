<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";
import type { VIcon } from "vuetify/components";

// The shell every non-authored message line shares: a leading icon, one sentence of content, then the timestamp
// And the reaction row. Only the icon and the sentence differ between them.
interface Props extends Pick<MessageComponentProps<StandardMessageEntity>, "active" | "isPreview" | "message"> {
  icon: string;
  iconColor?: VIcon["$props"]["color"];
}

defineSlots<{ default: () => VNode }>();
const { active, icon, iconColor, isPreview = false, message } = defineProps<Props>();
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <v-icon :icon :color="iconColor" size="small" />
    </template>
    <slot />
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
