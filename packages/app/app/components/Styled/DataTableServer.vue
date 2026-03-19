<script setup lang="ts">
import { useColorsStore } from "@/store/colors";
import { VDataTableServer } from "vuetify/components/VDataTable";

interface StyledDataTableServerProps {
  dataTableServerProps: VDataTableServer["$props"];
}

const slots = defineSlots<Record<keyof VDataTableServer["$slots"], Function>>();
const { dataTableServerProps } = defineProps<StyledDataTableServerProps>();
const colorsStore = useColorsStore();
const { backgroundOpacity40 } = storeToRefs(colorsStore);
</script>

<template>
  <!-- @vue-expect-error @TODO: https://github.com/vuetifyjs/vuetify/issues/21183 -->
  <v-data-table-server class="border-sm" :="dataTableServerProps">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </v-data-table-server>
</template>

<style scoped lang="scss">
:deep(.v-data-table__tr:hover) {
  background-color: v-bind(backgroundOpacity40);
}

:deep(.v-data-table__td) {
  background-color: transparent;
}
</style>
