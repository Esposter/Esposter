<script setup lang="ts">
import { todoListItemSchema } from "#shared/models/resource/todoList/TodoListItem";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { resetItem, saveItem } = todoListStore;
const { editedItem, isDirty, isEditFormDialogOpen, isEditFormValid, isFullScreenDialog, isSavable, originalItem } =
  storeToRefs(todoListStore);
</script>

<template>
  <StyledEditFormDialog
    v-if="editedItem"
    v-model="isEditFormDialogOpen"
    v-model:is-full-screen-dialog="isFullScreenDialog"
    v-model:is-edit-form-valid="isEditFormValid"
    :name="originalItem?.name ?? ''"
    :edited-item
    :original-item
    :remove="() => saveItem(true)"
    :save="() => saveItem()"
    :is-dirty
    :schema="todoListItemSchema"
    :is-savable
    :title="editedItem.name || 'Untitled todo'"
    @close="resetItem()"
  >
    <ResourceTodoListEditForm v-model="editedItem" />
  </StyledEditFormDialog>
</template>
