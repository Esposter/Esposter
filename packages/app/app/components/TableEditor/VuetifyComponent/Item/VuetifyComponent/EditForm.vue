<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-container v-if="editedItem" fluid>
    <v-row>
      <TableEditorItemNameTextField v-model="editedItem.name" />
      <TableEditorVuetifyComponentAutocomplete />
      <TableEditorVuetifyComponentPropertyAutocomplete />
      <TableEditorVuetifyComponentPreview />
    </v-row>
  </v-container>
</template>
