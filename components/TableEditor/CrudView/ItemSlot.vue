<script setup lang="ts">
import { type Item } from "@/models/tableEditor/Item";
import { type ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { defaultPropsMap } from "@/services/tableEditor/defaultPropsMap";
import { getItemCategoryDefinition } from "@/services/tableEditor/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";

interface TableEditorCrudViewItemSlotProps {
  item: Item;
}

const { item } = defineProps<TableEditorCrudViewItemSlotProps>();
const tableEditorStore = useTableEditorStore()();
const { tableEditorType } = storeToRefs(tableEditorStore);
const props = computed(() => defaultPropsMap[tableEditorType.value]);
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
