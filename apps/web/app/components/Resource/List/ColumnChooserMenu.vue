<script setup lang="ts">
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { mergeProps } from "vue";

interface Props {
  source: ResourceListSource;
}

const { source } = defineProps<Props>();
// Reads the same composable the table does rather than taking the column state as a model — one owner of
// Which columns exist, which are pinned, and which are hidden
const { hiddenColumnKeys, toggleableHeaders, toggleColumn } = useResourceListColumns(source);
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Manage view">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-view-column-outline" :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item v-for="{ key, title } of toggleableHeaders" :key :title @click="toggleColumn(key)">
        <template #prepend>
          <v-checkbox-btn density="compact" :model-value="!hiddenColumnKeys.includes(key)" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
