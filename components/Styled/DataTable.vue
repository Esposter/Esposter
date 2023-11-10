<script setup lang="ts">
import type { VDataTable } from "vuetify/components/VDataTable";

const slots = defineSlots<Record<keyof VDataTable["$slots"], Function>>();
const { border, backgroundOpacity40 } = useColors();
</script>

<template>
  <v-data-table class="border">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-data-table>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border) !important;
}

:deep(.v-data-table__tr:hover) {
  background-color: v-bind(backgroundOpacity40);
}

:deep(.v-data-table__td) {
  background-color: transparent !important;
}
</style>
