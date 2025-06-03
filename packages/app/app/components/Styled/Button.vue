<script setup lang="ts">
import type { VBtn } from "vuetify/components";

interface StyledButtonProps {
  buttonProps?: VBtn["$props"];
}

const { buttonProps } = defineProps<StyledButtonProps>();
const slots = defineSlots<Record<keyof VBtn["$slots"], Function>>();
</script>

<template>
  <v-btn class="button" un-color-white="!" :="buttonProps">
    <template v-for="(_slot, name) of slots" #[name]>
      <slot :name />
    </template>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnight-bloom !important;
}
</style>
