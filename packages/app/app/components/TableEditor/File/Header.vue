<script setup lang="ts">
const isImportDialogOpen = ref(false);
</script>

<template>
  <v-toolbar pt-4>
    <v-toolbar-title px-4>
      <TableEditorTypeSelect />
      <div pt-4 flex items-center gap-x-4>
        <TableEditorFileDataSourceTypeSelect @update:model-value="isImportDialogOpen = true" />
        <TableEditorFileImportDialog v-model="isImportDialogOpen" />
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>
