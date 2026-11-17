<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { UiRules } from "#src/services/ui/UiRules";
import { useTodoListStore } from "#src/store/resource/todoList/index";

const todoListStore = useTodoListStore();
const { addItem } = todoListStore;
const name = ref("");
// Only the limit, and no count under the field until it is passed, so the field lines up with the button beside it
const nameRules = [UiRules.maxLength(ITEM_NAME_MAX_LENGTH)];
</script>

<!-- The field a visit starts with: Enter adds the todo it names and leaves the field empty and focused for the next,
     While a due date and notes are set by opening the new row -->
<template>
  <form
    flex-1
    min-w-0
    @keydown.esc="name = ''"
    @submit.prevent="
      () => {
        const submittedName = name;
        name = '';
        addItem(submittedName, () => {
          if (!name) name = submittedName;
        });
      }
    "
  >
    <UiTextField v-model="name" is-label-hidden label="Add a todo" placeholder="Add a todo" :rules="nameRules" />
  </form>
</template>
