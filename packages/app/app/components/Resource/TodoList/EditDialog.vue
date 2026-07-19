<script setup lang="ts">
import { todoListItemSchema } from "#shared/models/resource/todoList/TodoListItem";
import { useTodoListStore } from "@/store/resource/todoList";
import { withFinalizerAsync } from "@esposter/shared";

const todoListStore = useTodoListStore();
const { resetItem, saveItem } = todoListStore;
const { editedItem, editForm, editFormDialog, isDirty, isEditFormValid, isFullScreenDialog, isSavable, originalItem } =
  storeToRefs(todoListStore);
</script>

<template>
  <StyledEditFormDialog
    v-if="editedItem"
    v-model="editFormDialog"
    :name="originalItem?.name ?? ''"
    :edited-item
    :original-item
    :is-dirty
    :is-edit-form-valid
    :schema="todoListItemSchema"
    :is-full-screen-dialog
    :is-savable
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
    @update:edit-form="editForm = $event"
    @update:fullscreen-dialog="isFullScreenDialog = $event"
  >
    <ResourceTodoListEditForm v-model="editedItem" />
  </StyledEditFormDialog>
</template>
