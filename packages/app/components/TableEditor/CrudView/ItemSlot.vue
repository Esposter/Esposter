<script setup lang="ts">
import type { Item } from "@/models/tableEditor/Item";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { DefaultPropsMap } from "@/services/tableEditor/DefaultPropsMap";
import { getItemCategoryDefinition } from "@/services/tableEditor/getItemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";

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
