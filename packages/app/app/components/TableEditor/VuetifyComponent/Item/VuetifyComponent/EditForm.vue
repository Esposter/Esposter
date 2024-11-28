<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
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
