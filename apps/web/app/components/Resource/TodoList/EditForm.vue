<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const modelValue = defineModel<TodoListItem>({ required: true });
</script>

<template>
  <div flex flex-col gap-4>
    <!-- The same star the row trails, saved with the rest of the form -->
    <div flex gap-2 items-center>
      <div flex-1 min-w-0><ResourceTodoListItemNameTextField v-model="modelValue.name" /></div>
      <UiIconButton
        :aria-pressed="Boolean(modelValue.isImportant)"
        label="Important"
        :meaning="UiIconMeaning.Favorite"
        :variant="UiButtonVariant.Quiet"
        @click="modelValue.isImportant = modelValue.isImportant ? undefined : true"
      />
    </div>
    <ResourceTodoListSteps v-model="modelValue.steps" />
    <RichTextEditor v-model="modelValue.notes" height="15rem" :limit="TODO_LIST_ITEM_NOTES_MAX_LENGTH" />
    <UiDateField v-model="modelValue.dueAt" is-clearable is-time label="Due date" placeholder="No due date" />
  </div>
</template>
