<script setup lang="ts">
import { TableEditorTypeItemSchemaMap } from "@/services/tableEditor/TableEditorTypeItemSchemaMap";
import { useTableEditorStore } from "@/store/tableEditor";

const slots = defineSlots<{ "append-header": () => VNode; "prepend-actions": () => VNode }>();
const tableEditorStore = useTableEditorStore();
const { resetItem, save } = tableEditorStore;
const {
  editedItem,
  editFormDialog,
  editFormRef,
  isEditFormValid,
  isFullScreenDialog,
  isSavable,
  originalItem,
  tableEditorType,
} = storeToRefs(tableEditorStore);
const component = computed(() => (editedItem.value ? useEditFormComponent(editedItem.value.type) : undefined));
const schema = computed(() => TableEditorTypeItemSchemaMap[tableEditorType.value]);
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
      :original-item
      :is-edit-form-valid
      :schema
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
      <template v-if="slots['prepend-actions']" #prepend-actions>
        <slot name="prepend-actions" />
      </template>
      <component :is="component" v-model="editedItem" />
    </StyledEditFormDialog>
  </v-toolbar>
</template>
