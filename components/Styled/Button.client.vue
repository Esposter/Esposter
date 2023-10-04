<script setup lang="ts">
import type { VBtn } from "vuetify/components";

const slots = defineSlots<Record<keyof VBtn["$slots"], Function>>();
</script>

<template>
  <v-btn class="button" un-color="#fff!" case-normal="!">
    <template v-for="(_, slot) of slots" #[slot]>
      <slot :name="slot" />
    </template>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnightBloom !important;
}
</style>
