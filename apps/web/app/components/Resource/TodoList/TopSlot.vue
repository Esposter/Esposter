<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { UiRules } from "@/services/ui/UiRules";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { addItem } = todoListStore;
const { searchQuery } = storeToRefs(todoListStore);
const name = ref("");
// Only the limit, and no count under the field until it is passed, so the field lines up with the button beside it
const nameRules = [UiRules.maxLength(ITEM_NAME_MAX_LENGTH)];
const isSearchOpen = ref(false);
</script>

<!-- The field a visit starts with: Enter adds the todo it names and leaves the field empty and focused for the next, while
     A due date and notes are set by opening the new row. Search folds into a button beside it, so the row above the list
     Never holds two fields side by side -->
<template>
  <div flex gap-2 items-center>
    <form
      flex-1
      min-w-0
      @keydown.esc="name = ''"
      @submit.prevent="
        async () => {
          const addedName = name;
          name = '';
          const isSuccessful = await addItem(addedName);
          // Nothing typed is lost to a refused save, unless the next todo is already being typed over it
          if (!isSuccessful && !name) name = addedName;
        }
      "
    >
      <UiTextField v-model="name" is-label-hidden label="Add a todo" placeholder="Add a todo" :rules="nameRules" />
    </form>
    <div
      v-if="isSearchOpen || searchQuery"
      flex-1
      min-w-0
      @focusout="isSearchOpen = false"
      @keydown.esc="searchQuery = ''"
    >
      <UiTextField v-model="searchQuery" is-autofocus label="Search todos" :type="UiTextFieldType.Search" />
    </div>
    <UiIconButton
      v-else
      label="Search todos"
      :meaning="UiIconMeaning.Search"
      :variant="UiButtonVariant.Quiet"
      @click="isSearchOpen = true"
    />
  </div>
</template>
