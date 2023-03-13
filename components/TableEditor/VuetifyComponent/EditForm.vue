<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: Ref<VuetifyComponent | null> };
</script>

<template>
  <v-container v-if="editedItem" fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="editedItem.name" label="Name" :rules="[formRules.required]" />
      </v-col>
      <TableEditorVuetifyComponentAutocomplete />
      <TableEditorVuetifyComponentPropertyAutocomplete />
      <TableEditorVuetifyComponentPreview />
    </v-row>
  </v-container>
</template>
