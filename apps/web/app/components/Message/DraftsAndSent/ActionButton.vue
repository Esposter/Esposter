<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { DRAFTS_AND_SENT_ACTION_BUTTON_PROPS } from "@/services/message/draftsAndSent/constants";

interface Props {
  buttonProps?: VBtn["$props"];
  icon: string;
  text: string;
}

const { buttonProps, icon, text } = defineProps<Props>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const mergedButtonProps = computed(() => ({ ...DRAFTS_AND_SENT_ACTION_BUTTON_PROPS, ...buttonProps }));
</script>

<template>
  <StyledTooltipIconButton :button-props="mergedButtonProps" :icon :text @click.stop="emit('click', $event)" />
</template>
