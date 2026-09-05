<script setup lang="ts">
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import type { Item } from "@/models/shared/Item";

import { useNavigationTrailStore } from "@/store/navigationTrail";
import { RoutePath } from "@esposter/shared";

interface Props {
  source: ResourceListSource;
}

const { source } = defineProps<Props>();
const search = defineModel<string>("search", { required: true });
const isSummaryView = defineModel<boolean>("isSummaryView", { required: true });
const isGroupedByType = defineModel<boolean>("isGroupedByType", { required: true });
const emit = defineEmits<{ export: []; refresh: [] }>();
// When narrow, the toolbar commands collapse into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const navigationTrailStore = useNavigationTrailStore();
const { closeTo } = storeToRefs(navigationTrailStore);
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
      await navigateTo(RoutePath.ResourceExplorerRecycleBin);
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
    <ResourceListColumnChooserMenu :source />
    <StyledOverflowMenu v-if="smAndDown" icon="mdi-dots-horizontal" :items="toolbarItems" />
    <StyledTooltipIconButton :to="closeTo" icon="mdi-close" text="Close" />
  </v-toolbar>
</template>
