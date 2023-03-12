<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: VuetifyComponent };
const tab = ref<number>();
</script>

<template>
  <v-tabs v-model="tab" bg-color="primary" stacked>
    <v-tab value="tab-1" case="normal!">
      <v-icon icon="mdi-cog" />
      Settings
    </v-tab>

    <v-tab value="tab-2" case="normal!">
      <v-icon icon="mdi-vuejs" />
      Properties
    </v-tab>

    <v-tab value="tab-3" case="normal!">
      <v-icon icon="mdi-magnify-scan" />
      Preview
    </v-tab>
  </v-tabs>

  <v-window v-if="editedItem" v-model="tab">
    <v-window-item value="tab-1">
      <TableEditorVuetifyComponentSettingsTabContent />
    </v-window-item>

    <v-window-item value="tab-2">
      <TableEditorVuetifyComponentPropertiesTabContent />
    </v-window-item>

    <v-window-item value="tab-3">
      <TableEditorVuetifyComponentPreviewTabContent />
    </v-window-item>
  </v-window>
</template>
