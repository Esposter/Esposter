<script setup lang="ts">
import { useColorsStore } from "@/store/colors";
import { VDataTableServer } from "vuetify/components/VDataTable";

interface StyledDataTableServerProps {
  // Standalone tables draw their own box border; panels that own their edges pass false
  border?: boolean;
  dataTableServerProps: VDataTableServer["$props"];
}

const slots = defineSlots<Record<keyof VDataTableServer["$slots"], Function>>();
const { border = true, dataTableServerProps } = defineProps<StyledDataTableServerProps>();
const colorsStore = useColorsStore();
const { "background-opacity-40": backgroundOpacity40 } = storeToRefs(colorsStore);
</script>

<template>
  <!-- @vue-expect-error @TODO: https://github.com/vuetifyjs/vuetify/issues/21183 -->
  <v-data-table-server :class="{ 'b-1': border }" :="dataTableServerProps">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </v-data-table-server>
</template>

<style scoped>
:deep(.v-data-table__tr:hover) {
  background-color: v-bind(backgroundOpacity40);
}

:deep(.v-data-table__td) {
  background-color: transparent;
}
</style>
