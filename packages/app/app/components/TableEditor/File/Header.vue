<script setup lang="ts">
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/DataSourceTypeItemCategoryDefinitions";

const isMenuOpen = ref(false);
const isDialogOpen = ref(false);
const selectedType = ref<DataSourceType | null>(null);

const openDialog = (type: DataSourceType) => {
  selectedType.value = type;
  isMenuOpen.value = false;
  isDialogOpen.value = true;
};
</script>

<template>
  <v-toolbar pt-4>
    <v-toolbar-title px-4>
      <TableEditorTypeSelect />
      <div pt-4 flex items-center gap-x-4>
        <v-menu v-model="isMenuOpen">
          <template #activator="{ props: menuProps }">
            <v-btn icon="mdi-plus" :="menuProps" />
          </template>
          <v-list>
            <v-list-item
              v-for="item in DataSourceTypeItemCategoryDefinitions"
              :key="item.value"
              :title="item.title"
              @click="openDialog(item.value)"
            />
          </v-list>
        </v-menu>
        <TableEditorFileDialog v-if="selectedType" v-model="isDialogOpen" :data-source-type="selectedType" />
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>
