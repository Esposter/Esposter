<script setup lang="ts">
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useTableEditorStore } from "@/store/tableEditor";

defineSlots<{ "append-header": () => VNode }>();
const tableEditorStore = useTableEditorStore();
const { resetItem, save } = tableEditorStore;
const {
  editedItem,
  editFormDialog,
  editFormRef,
  formError,
  isEditFormValid,
  isFullScreenDialog,
  isSavable,
  originalItem,
} = storeToRefs(tableEditorStore);
const component = computed(() => (editedItem.value ? useEditFormComponent(editedItem.value.type) : undefined));
const isFileItem = computed(() => !!editedItem.value && editedItem.value.type in DataSourceConfigurationMap);
</script>

<template>
  <v-toolbar pt-4>
    <v-toolbar-title px-4>
      <TableEditorTypeSelect />
      <div pt-2>
        <TableEditorSearchBar />
      </div>
      <div py-2 flex flex-wrap gap-2>
        <v-spacer />
        <TableEditorCreateItemButton />
        <TableEditorExportButton />
        <TableEditorImportButton />
        <slot name="append-header" />
      </div>
    </v-toolbar-title>
    <StyledEditFormDialog
      v-if="editedItem"
      v-model="editFormDialog"
      :name="originalItem?.name ?? ''"
      :edited-item
      :form-error
      :original-item
      :is-edit-form-valid
      :is-full-screen-dialog
      :is-savable
      @close="resetItem()"
      @delete="
        async (onComplete) => {
          await save(true);
          onComplete();
        }
      "
      @save="save()"
      @update:edit-form-ref="editFormRef = $event"
      @update:fullscreen-dialog="isFullScreenDialog = $event"
    >
      <template v-if="isFileItem" #prepend-actions>
        <TableEditorFileImportButton />
        <TableEditorFileExportButton />
      </template>
      <v-container v-if="editedItem" overflow-y-auto fluid>
        <component :is="component" v-model="editedItem" />
      </v-container>
    </StyledEditFormDialog>
  </v-toolbar>
</template>
