<script setup lang="ts">
import type { VCard } from "vuetify/components";

const slots = defineSlots<Record<keyof VCard["$slots"], Function>>();
const { border } = useColors();
</script>

<template>
  <v-card class="custom-border">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-card>
</template>

<style scoped lang="scss">
.custom-border {
  border: 1px solid v-bind(border) !important;
}
</style>
