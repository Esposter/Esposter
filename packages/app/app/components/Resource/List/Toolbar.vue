<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { RoutePath } from "@esposter/shared";

interface ResourceListToolbarProps {
  closeTo?: string;
}

const search = defineModel<string>("search", { required: true });
const isSummaryView = defineModel<boolean>("isSummaryView", { required: true });
const isGroupedByType = defineModel<boolean>("isGroupedByType", { required: true });
const hiddenColumnKeys = defineModel<string[]>("hiddenColumnKeys", { required: true });
const { closeTo } = defineProps<ResourceListToolbarProps>();
const emit = defineEmits<{ export: []; refresh: [] }>();
// When narrow, the toolbar commands collapse into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const toolbarItems = computed<Item[]>(() => [
  {
    active: isSummaryView.value,
    icon: "mdi-view-grid-outline",
    onClick: () => {
      isSummaryView.value = !isSummaryView.value;
    },
    title: "Summary view",
  },
  {
    active: isGroupedByType.value,
    icon: "mdi-format-list-group",
    onClick: () => {
      isGroupedByType.value = !isGroupedByType.value;
    },
    title: "Group by type",
  },
  { icon: "mdi-file-export-outline", onClick: () => emit("export"), title: "Export CSV" },
  { icon: "mdi-refresh", onClick: () => emit("refresh"), title: "Refresh" },
  {
    icon: "mdi-delete-outline",
    onClick: async () => {
      await navigateTo(RoutePath.ResourcesRecycleBin);
    },
    title: "Recycle bin",
  },
]);
</script>

<template>
  <v-toolbar px-4 py-2 b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <v-text-field
      v-model="search"
      clearable
      density="comfortable"
      hide-details
      label="Search resources"
      max-width="24rem"
      min-width="12rem"
      prepend-inner-icon="mdi-magnify"
    />
    <v-spacer />
    <StyledTooltipIconButton
      v-for="{ active, icon, onClick, title } of smAndDown ? [] : toolbarItems"
      :key="title"
      :icon
      :text="title"
      :button-props="{ active }"
      @click="onClick"
    />
    <ResourceListColumnChooserMenu v-model="hiddenColumnKeys" />
    <StyledOverflowMenu v-if="smAndDown" icon="mdi-dots-horizontal" :items="toolbarItems" />
    <StyledTooltipIconButton v-if="closeTo" icon="mdi-close" text="Close" @click="navigateTo(closeTo)" />
  </v-toolbar>
</template>
