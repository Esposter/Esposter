<script setup lang="ts">
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { mergeProps } from "vue";

interface ResourceListColumnChooserMenuProps {
  pinnedColumnKey?: string;
}

const { pinnedColumnKey } = defineProps<ResourceListColumnChooserMenuProps>();
const hiddenColumnKeys = defineModel<string[]>({ required: true });
// Name is the identity column, and the pinned one is what the view is sorted by — neither can be hidden
const toggleableHeaders = computed(() =>
  ResourceHeaders.filter(({ key }) => key !== "name" && key !== pinnedColumnKey),
);
const toggleColumn = (key: string) => {
  hiddenColumnKeys.value = hiddenColumnKeys.value.includes(key)
    ? hiddenColumnKeys.value.filter((columnKey) => columnKey !== key)
    : [...hiddenColumnKeys.value, key];
};
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
