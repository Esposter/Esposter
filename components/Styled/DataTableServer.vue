<script setup lang="ts">
import type { VDataTableServer } from "vuetify/components/VDataTable";

const slots = defineSlots<Record<keyof VDataTableServer["$slots"], Function>>();
const { backgroundOpacity40 } = useColors();
</script>

<template>
  <!-- @TODO: Vue doesn't support defineProps<VDataTableServer["$props"]> yet -->
  <!-- @vue-expect-error -->
  <v-data-table-server class="border-sm">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </v-data-table-server>
</template>

<style scoped lang="scss">
:deep(.v-data-table__tr:hover) {
  background-color: v-bind(backgroundOpacity40);
}

:deep(.v-data-table__td) {
  background-color: transparent !important;
}
</style>
