<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

interface StyledTooltipIconButtonProps {
  buttonProps?: VBtn["$props"];
  icon: string;
  text?: string;
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: () => VNode }>();
const { buttonProps, icon, text, tooltipProps } = defineProps<StyledTooltipIconButtonProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip :text :="tooltipProps">
    <template #activator="{ props }">
      <v-btn :icon :="{ ...props, ...buttonProps }" @click="emit('click', $event)" />
    </template>
    <!-- The explicit #default is required: v-slot + v-if compiles to conditional slot registration,
      while a bare template v-if always registers the slot, suppressing VTooltip's text prop -->
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </v-tooltip>
</template>
