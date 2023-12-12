<script setup lang="ts">
import type { VDataTable } from "vuetify/components/VDataTable";

const slots = defineSlots<Record<keyof VDataTable["$slots"], Function>>();
const { backgroundOpacity40 } = useColors();
</script>

<template>
  <v-data-table class="border-sm">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-data-table>
</template>

<style scoped lang="scss">
:deep(.v-data-table__tr:hover) {
  background-color: v-bind(backgroundOpacity40);
}

:deep(.v-data-table__td) {
  background-color: transparent !important;
}
</style>
