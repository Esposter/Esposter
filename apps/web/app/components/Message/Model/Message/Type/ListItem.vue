<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface Props extends Pick<MessageComponentProps<StandardMessageEntity>, "isPreview"> {
  active?: boolean;
}

defineSlots<{ default: () => VNode; prepend?: () => VNode }>();
const { active, isPreview = false } = defineProps<Props>();
</script>

<!-- One message's row, as Discord lays one out: the author's column on the left, and the message beside it, never
     clamped however many lines it holds. The row takes the page's hover tint while it is the one being acted on. A
     preview only shows a message, so nothing in it takes the pointer or a selection -->
<template>
  <div :class="{ 'bg-hover': active }" px-4 flex gap-4>
    <div v-if="$slots.prepend" flex shrink-0 self-start justify-center w="[var(--avatar-width)]">
      <slot name="prepend" />
    </div>
    <div :class="{ 'pointer-events-none select-none': isPreview }" flex flex-1 flex-col gap-1 min-w-0>
      <slot />
    </div>
  </div>
</template>
