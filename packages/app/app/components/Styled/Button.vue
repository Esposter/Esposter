<script setup lang="ts">
import { VBtn } from "vuetify/components";

interface StyledButtonProps {
  buttonProps?: VBtn["$props"];
}

const { buttonProps } = defineProps<StyledButtonProps>();
const slots = defineSlots<Record<keyof VBtn["$slots"], Function>>();
</script>

<template>
  <v-btn class="button" un-color-white="!" :="buttonProps">
    <template v-for="(_, slot) of slots" #[slot]>
      <slot :name="slot" />
    </template>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnight-bloom !important;
}
</style>
