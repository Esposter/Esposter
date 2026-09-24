<script setup lang="ts">
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { editedItem, editFormDialog, searchQuery } = storeToRefs(todoListStore);
</script>

<template>
  <div flex flex-wrap gap-2 items-end>
    <div flex-1 min-w-48>
      <UiTextField v-model="searchQuery" label="Search todos" />
    </div>
    <UiButton
      :variant="UiButtonVariant.Accent"
      flex
      gap-2
      items-center
      @click="
        () => {
          editedItem = new TodoListItem();
          editFormDialog = true;
        }
      "
    >
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add a todo
    </UiButton>
  </div>
</template>
