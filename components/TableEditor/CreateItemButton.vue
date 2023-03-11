<script setup lang="ts">
import type { IItem } from "@/models/tableEditor/IItem";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { tableEditorItemCategoryDefinitions } from "@/services/tableEditor/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { mergeProps } from "vue";

const tableEditorStore = useTableEditorStore();
const { editFormDialog } = storeToRefs(tableEditorStore);
const itemStore = useItemStore();
const { editedItem } = storeToRefs(itemStore);
const createItem = (itemCategoryDefinition: ItemCategoryDefinition<IItem>) => {
  editedItem.value = itemCategoryDefinition.create();
  editFormDialog.value = true;
};
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="`Add an item`">
        <template #activator="{ props: tooltipProps }">
          <v-btn variant="elevated" :flat="false" :="mergeProps(menuProps, tooltipProps)">
            <v-icon icon="mdi-plus" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-list>
      <v-list-item
        v-for="icd in tableEditorItemCategoryDefinitions"
        :key="icd.value"
        :prepend-icon="icd.icon"
        :title="icd.title"
        @click="createItem(icd)"
      />
    </v-list>
  </v-menu>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-icon) {
  margin-inline-end: 0.25rem;
}
</style>
