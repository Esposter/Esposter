<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

interface StyledTooltipIconButtonProps {
  buttonProps?: VBtn["$props"];
  icon: string;
  text?: string;
  tooltipProps?: VTooltip["$props"];
}

const { buttonProps, icon, text, tooltipProps } = defineProps<StyledTooltipIconButtonProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip :text :="tooltipProps">
    <template #activator="{ props }">
      <v-btn :icon :="{ ...props, ...buttonProps }" @click="emit('click', $event)" />
    </template>
    <slot />
  </v-tooltip>
</template>
