<script setup lang="ts">
import type { VCard } from "vuetify/components";

const slots = defineSlots<Record<keyof VCard["$slots"], Function>>();
const { border } = useColors();
</script>

<template>
  <v-card class="border">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-card>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border) !important;
}
</style>
