<script setup lang="ts">
import type { VBtn } from "vuetify/components";

interface StyledButtonProps {
  buttonProps?: VBtn["$props"];
}

const BUTTON_STYLE = { backgroundImage: "var(--midnight-bloom)" };

const slots = defineSlots<Record<keyof VBtn["$slots"], () => VNode>>();
const { buttonProps } = defineProps<StyledButtonProps>();
</script>

<template>
  <v-btn :style="BUTTON_STYLE" color-white :="buttonProps">
    <template v-for="(_slot, name) of slots" #[name]>
      <slot :name />
    </template>
  </v-btn>
</template>
