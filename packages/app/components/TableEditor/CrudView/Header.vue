<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { useTableEditorStore } from "@/store/tableEditor";

defineSlots<{
  "append-header": (props: Record<string, never>) => unknown;
}>();

const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { save } = tableEditorStore;
const {
  tableEditor,
  editedItem,
  editedIndex,
  editFormDialog,
  editFormRef,
  isEditFormValid,
  isFullScreenDialog,
  isSavable,
} = storeToRefs(tableEditorStore);
const component = computed(() => (editedItem.value ? useEditFormComponent(editedItem.value.type) : null));
const originalItem = computed(() => {
  if (!editedItem.value) return null;

  const originalItem = tableEditor.value.items.find((i) => i.id === editedItem.value?.id);
  if (!originalItem) return null;

  return originalItem;
});
</script>

<template>
  <v-toolbar pt-4 pr-4>
    <v-toolbar-title>
      <TableEditorTypeSelect />
      <div pt-4 flex items-center>
        <TableEditorSearchBar />
        <v-divider mx-4="!" thickness="2" vertical inset />
        <TableEditorCreateItemButton />
        <slot name="append-header" />
      </div>
    </v-toolbar-title>
    <StyledEditFormDialog
      v-if="editedItem && originalItem"
      v-model="editFormDialog"
      :name="originalItem.name"
      :edited-item
      :edited-index
      :original-item
      :edit-form-ref
      :is-edit-form-valid
      :is-full-screen-dialog
      :is-savable
      @update:edit-form-ref="(value) => (editFormRef = value)"
      @update:fullscreen-dialog="(value) => (isFullScreenDialog = value)"
      @save="save()"
      @delete="
        async (onComplete) => {
          await save(true);
          onComplete();
        }
      "
    >
      <component :is="component" v-if="editedItem" />
    </StyledEditFormDialog>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}
</style>
