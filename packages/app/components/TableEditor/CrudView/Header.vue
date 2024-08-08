<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";

import { useTableEditorStore } from "@/store/tableEditor";

defineSlots<{
  "append-header": (props: Record<string, never>) => unknown;
}>();

const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { resetItem, save } = tableEditorStore;
const { editedItem, editFormDialog, editFormRef, isEditFormValid, isFullScreenDialog, isSavable, originalItem } =
  storeToRefs(tableEditorStore);
const component = computed(() => (editedItem.value ? useEditFormComponent(editedItem.value.type) : null));
</script>

<template>
  <v-toolbar pt-4>
    <v-toolbar-title px-4>
      <TableEditorTypeSelect />
      <div pt-4 flex items-center>
        <TableEditorSearchBar />
        <v-divider mx-4="!" thickness="2" vertical inset />
        <TableEditorCreateItemButton />
        <slot name="append-header" />
      </div>
    </v-toolbar-title>
    <StyledEditFormDialog
      v-if="editedItem"
      v-model="editFormDialog"
      :name="originalItem?.name ?? ''"
      :edited-item="editedItem"
      :original-item="originalItem"
      :is-edit-form-valid="isEditFormValid"
      :is-full-screen-dialog="isFullScreenDialog"
      :is-savable="isSavable"
      @update:edit-form-ref="(value) => (editFormRef = value)"
      @update:fullscreen-dialog="(value) => (isFullScreenDialog = value)"
      @save="save()"
      @close="resetItem()"
      @delete="
        async (onComplete) => {
          await save(true);
          onComplete();
        }
      "
    >
      <component :is="component" />
    </StyledEditFormDialog>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}
</style>
