<script setup lang="ts">
import type { VBtn } from "vuetify/components";

interface StyledButtonProps {
  buttonProps?: VBtn["$props"];
}

const slots = defineSlots<Record<keyof VBtn["$slots"], () => VNode>>();
const { buttonProps } = defineProps<StyledButtonProps>();
</script>

<template>
  <v-btn bg="[image:var(--midnight-bloom)]" un-color-white :="buttonProps">
    <template v-for="(_slot, name) of slots" #[name]>
      <slot :name />
    </template>
  </v-btn>
</template>
