<script setup lang="ts" generic="T extends string, TItem extends AItemEntity & ItemEntityType<T>">
import type { AItemEntity } from "@/models/tableEditor/AItemEntity";
import { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { getItemCategoryDefinition } from "@/services/tableEditor/itemCategoryDefinition";
import type { DataTableHeader } from "@/services/vuetify/dataTable";
import { useTableEditorStore } from "@/store/tableEditor";
import { VDataTable } from "vuetify/labs/VDataTable";

interface CrudViewProps {
  itemCategoryDefinitions: ItemCategoryDefinition<T>[];
}

const props = defineProps<CrudViewProps>();
const { itemCategoryDefinitions } = toRefs(props);
const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditor, searchQuery } = storeToRefs(tableEditorStore);
const headers = ref<DataTableHeader[]>([
  { title: "Name", key: "name" },
  { title: "Type", key: "type" },
  { title: "Notes", key: "notes" },
]);

const getItemCategoryDefinitionByItem = (item: unknown) =>
  getItemCategoryDefinition(itemCategoryDefinitions.value, (item as { raw: TItem }).raw);
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <v-data-table
      display="flex"
      flex="1 col"
      :headers="headers"
      :items="tableEditor?.items"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      height="100%"
      @click:row="(_, { item }) => editItem(item.raw.id)"
    >
      <template #top>
        <TableEditorCrudViewHeader :item-category-definitions="itemCategoryDefinitions" />
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip>
          <v-icon :icon="getItemCategoryDefinitionByItem(item).icon" />
          {{ getItemCategoryDefinitionByItem(item).title }}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>
