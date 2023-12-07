<script setup lang="ts">
import type { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { useTableEditorStore } from "@/store/tableEditor";

const { border } = useColors();
const tableEditorStore = useTableEditorStore<VuetifyComponentItem>()();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <template v-if="editedItem">
    <v-col cols="12">Preview</v-col>
    <v-col cols="12">
      <div class="custom-border elevation--1" w-full aspect="video" flex justify-center items-center rd>
        <component :is="editedItem.component" :="editedItem.props" />
      </div>
    </v-col>
  </template>
</template>

<style scoped lang="scss">
.custom-border {
  border: 1px solid v-bind(border);
}
</style>
