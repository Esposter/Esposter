<script setup lang="ts">
import type { VBtn, VMenu, VTooltip } from "vuetify/components";

import { mergeProps } from "vue";

interface StyledTooltipMenuIconButtonProps {
  buttonProps?: VBtn["$props"];
  icon: string;
  menuProps?: VMenu["$props"];
  text?: string;
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default: () => VNode }>();
const { buttonProps = {}, icon, menuProps, text, tooltipProps } = defineProps<StyledTooltipMenuIconButtonProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const isOpen = defineModel<boolean>({ default: false });
</script>

<template>
  <v-menu v-model="isOpen" :="menuProps">
    <template #activator="{ props: menuActivatorProps }">
      <v-tooltip :text :="tooltipProps">
        <template #activator="{ props: tooltipActivatorProps }">
          <v-btn
            :icon
            :="mergeProps(menuActivatorProps, tooltipActivatorProps, buttonProps)"
            @click="emit('click', $event)"
          />
        </template>
      </v-tooltip>
    </template>
    <slot />
  </v-menu>
</template>
