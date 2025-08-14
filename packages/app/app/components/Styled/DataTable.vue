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
  <!-- @vue-expect-error @TODO: https://github.com/vuetifyjs/vuetify/issues/21183 -->
  <v-data-table class="border-sm" :="dataTableProps">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
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
