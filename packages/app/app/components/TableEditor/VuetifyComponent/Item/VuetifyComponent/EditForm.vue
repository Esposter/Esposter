<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

const modelValue = defineModel<VuetifyComponentItem>({ required: true });
</script>

<template>
  <v-row>
    <TableEditorItemNameTextField v-model="modelValue.name" />
    <TableEditorVuetifyComponentAutocomplete />
    <TableEditorVuetifyComponentPropertyAutocomplete />
    <TableEditorVuetifyComponentPreview />
  </v-row>
</template>
