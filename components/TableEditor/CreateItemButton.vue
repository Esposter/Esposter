<script setup lang="ts" generic="T extends string">
import { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";
import { mergeProps } from "vue";

interface CreateItemButtonProps {
  itemCategoryDefinitions: ItemCategoryDefinition<T>[];
}

const props = defineProps<CreateItemButtonProps>();
const { itemCategoryDefinitions } = toRefs(props);
const tableEditorStore = useTableEditorStore()();
const { editFormDialog, editedItem } = storeToRefs(tableEditorStore);
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
        v-for="icd in itemCategoryDefinitions"
        :key="icd.value"
        @click="
          () => {
            editedItem = icd.create();
            editFormDialog = true;
          }
        "
      >
        <v-icon :icon="icd.icon" />
        {{ icd.title }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-icon) {
  margin-inline-end: 0.25rem;
}
</style>
