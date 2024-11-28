<script setup lang="ts">
import { VDataTable } from "vuetify/components/VDataTable";

interface StyledDataTableProps {
  dataTableProps: VDataTable["$props"];
}

const { dataTableProps } = defineProps<StyledDataTableProps>();
const slots = defineSlots<Record<keyof VDataTable["$slots"], Function>>();
const { backgroundOpacity40 } = useColors();
</script>

<template>
  <v-data-table class="border-sm" :="dataTableProps">
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
