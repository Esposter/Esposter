<script setup lang="ts">
import type { Item } from "@/models/tableEditor/Item";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { getItemCategoryDefinition } from "@/services/tableEditor/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";
import { DefaultPropsMap } from "~/services/tableEditor/DefaultPropsMap";

interface TableEditorCrudViewItemSlotProps {
  item: Item;
}

const { item } = defineProps<TableEditorCrudViewItemSlotProps>();
const tableEditorStore = useTableEditorStore()();
const { tableEditorType } = storeToRefs(tableEditorStore);
const props = computed(() => DefaultPropsMap[tableEditorType.value]);
const itemCategoryDefinition = computed(() =>
  getItemCategoryDefinition(props.value.itemCategoryDefinitions as unknown as ItemCategoryDefinition[], item),
);
</script>

<template>
  <v-chip label>
    <v-icon pr-2 :icon="itemCategoryDefinition.icon" />
    {{ itemCategoryDefinition.title }}
  </v-chip>
</template>
~/services/tableEditor/DefaultPropsMap
