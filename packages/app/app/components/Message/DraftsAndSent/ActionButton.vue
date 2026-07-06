<script setup lang="ts">
import type { VBtn } from "vuetify/components";

interface MessageDraftsAndSentActionButtonProps {
  buttonProps?: VBtn["$props"];
  icon: string;
  text: string;
}

const { buttonProps, icon, text } = defineProps<MessageDraftsAndSentActionButtonProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ density: 'comfortable', size: 'small', variant: 'text', ...buttonProps }"
    :icon
    :text
    @click.stop="emit('click', $event)"
  />
</template>
