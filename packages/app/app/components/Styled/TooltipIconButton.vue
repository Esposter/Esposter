<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

interface StyledTooltipIconButtonProps {
  buttonProps?: VBtn["$props"];
  icon: string;
  isIconButton?: false;
  text?: string;
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: () => VNode }>();
const { buttonProps, icon, isIconButton = true, text, tooltipProps } = defineProps<StyledTooltipIconButtonProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip :text :="tooltipProps">
    <template #activator="{ props }">
      <v-btn v-if="isIconButton" :icon :="{ ...props, ...buttonProps }" @click="emit('click', $event)" />
      <v-btn v-else :="{ ...props, ...buttonProps }" @click="emit('click', $event)">
        <v-icon :icon />
      </v-btn>
    </template>
    <!-- The explicit #default is required: v-slot + v-if compiles to conditional slot registration,
      while a bare template v-if always registers the slot, suppressing VTooltip's text prop -->
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </v-tooltip>
</template>
