<script setup lang="ts">
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { editedItem, isEditFormDialogOpen, searchQuery } = storeToRefs(todoListStore);
</script>

<template>
  <div flex gap-2 items-center>
    <div flex-1 min-w-0>
      <UiTextField v-model="searchQuery" label="Search todos" :type="UiTextFieldType.Search" />
    </div>
    <UiButton
      :variant="UiButtonVariant.Accent"
      @click="
        () => {
          editedItem = new TodoListItem();
          isEditFormDialogOpen = true;
        }
      "
    >
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add a todo
    </UiButton>
  </div>
</template>
