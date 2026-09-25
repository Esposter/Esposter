<script setup lang="ts">
import { todoListItemSchema } from "#shared/models/resource/todoList/TodoListItem";
import { useTodoListStore } from "@/store/resource/todoList";
import { withFinalizerAsync } from "@esposter/shared";

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
    :is-dirty
    :schema="todoListItemSchema"
    :is-savable
    :title="editedItem.name || 'Untitled todo'"
    @close="resetItem()"
    @delete="
      async (onComplete) => {
        let isSuccessful = false;
        await withFinalizerAsync(
          async () => {
            isSuccessful = await saveItem(true);
          },
          () => {
            onComplete(isSuccessful);
          },
        );
      }
    "
    @save="saveItem()"
  >
    <ResourceTodoListEditForm v-model="editedItem" />
  </StyledEditFormDialog>
</template>
