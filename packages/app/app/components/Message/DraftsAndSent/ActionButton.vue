<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { DRAFTS_AND_SENT_ACTION_BUTTON_PROPS } from "@/services/message/draftsAndSent/constants";

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
    :button-props="{ ...DRAFTS_AND_SENT_ACTION_BUTTON_PROPS, ...buttonProps }"
    :icon
    :text
    @click.stop="emit('click', $event)"
  />
</template>
