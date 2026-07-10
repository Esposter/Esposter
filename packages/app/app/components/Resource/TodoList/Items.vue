<script setup lang="ts">
import type { ToData } from "@esposter/shared";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { TodoListItem, todoListItemSchema } from "#shared/models/resource/todoList/TodoListItem";
import { getItemCategoryDefinition } from "@/services/resource/getItemCategoryDefinition";
import { TodoListHeaders } from "@/services/resource/todoList/TodoListHeaders";
import { TodoListItemTypeItemCategoryDefinitions } from "@/services/resource/todoList/TodoListItemTypeItemCategoryDefinitions";
import { useTodoListStore } from "@/store/resource/todoList";
import { withFinalizerAsync } from "@esposter/shared";

const todoListStore = useTodoListStore();
const { editItem, loadContent, resetItem, saveItem } = todoListStore;
const {
  editedItem,
  editForm,
  editFormDialog,
  isDirty,
  isEditFormValid,
  isFullScreenDialog,
  isSavable,
  items,
  originalItem,
  searchQuery,
} = storeToRefs(todoListStore);
const isLoading = ref(true);
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<ToData<TodoListItem>>) => editItem({ id: item.id });

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <v-container v-else fluid flex flex-col h-full>
    <StyledDataTable
      flex
      flex-1
      flex-col
      :data-table-props="{
        height: '100%',
        headers: TodoListHeaders,
        items,
        search: searchQuery,
        sortBy: [{ key: 'name', order: 'asc' }],
      }"
      @click:row="onClickRow"
    >
      <template #top>
        <div flex gap-2 items-center pb-2>
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
          <v-tooltip text="Add a todo">
            <template #activator="{ props }">
              <v-btn
                variant="elevated"
                :flat="false"
                :="props"
                @click="
                  () => {
                    editedItem = new TodoListItem();
                    editFormDialog = true;
                  }
                "
              >
                <v-icon icon="mdi-plus" />
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip label>
          <v-icon pr-2 :icon="getItemCategoryDefinition(TodoListItemTypeItemCategoryDefinitions, item).icon" />
          {{ getItemCategoryDefinition(TodoListItemTypeItemCategoryDefinitions, item).title }}
        </v-chip>
      </template>
      <template #[`item.notes`]="{ item }">
        <div class="rich-text-content" v-html="item.notes" />
      </template>
    </StyledDataTable>
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
          await withFinalizerAsync(() => saveItem(true), onComplete);
        }
      "
      @save="saveItem()"
      @update:edit-form="editForm = $event"
      @update:fullscreen-dialog="isFullScreenDialog = $event"
    >
      <ResourceTodoListEditForm v-model="editedItem" />
    </StyledEditFormDialog>
  </v-container>
</template>
