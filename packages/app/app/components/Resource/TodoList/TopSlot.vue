<script setup lang="ts">
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { editedItem, editFormDialog, searchQuery } = storeToRefs(todoListStore);
</script>

<template>
  <div pb-2 flex gap-2 items-center>
    <v-text-field
      v-model="searchQuery"
      clearable
      density="compact"
      hide-details
      label="Search"
      max-width="16rem"
      prepend-inner-icon="mdi-magnify"
    />
    <v-spacer />
    <StyledTooltipIconButton
      :button-props="{ flat: false, variant: 'elevated' }"
      icon="mdi-plus"
      :is-icon-button="false"
      text="Add a todo"
      @click="
        () => {
          editedItem = new TodoListItem();
          editFormDialog = true;
        }
      "
    />
  </div>
</template>
