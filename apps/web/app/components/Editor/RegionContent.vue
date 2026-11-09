<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { UiTabItem } from "@/models/ui/UiTabItem";
import type { ResolvedRegion } from "vue-editor-layout-headless";

import { UiTabsVariant } from "@/models/ui/UiTabsVariant";
import { getRegionComponent } from "@/services/editor/getRegionComponent";
import { takeOne } from "@esposter/shared";

interface Props {
  // The name the region's tabs are announced by, which is the region's own name
  name: string;
  // The name of each panel, keyed by panel id, which a tab is titled by
  panelNameMap: Record<string, string>;
  region: ResolvedRegion;
  registry: EditorRegistry;
}

const { panelNameMap, region, registry } = defineProps<Props>();
// A reader who picks a tab chooses the region's panel, which the shell keeps in the reader's state
const emit = defineEmits<{ selectPanel: [panelId: string] }>();
// A region holding several present panels is tabbed, with one tab for each, and draws the panel its reader chose
const tabItems = computed<UiTabItem<string>[]>(() =>
  region.panels.map(({ id }) => ({ title: takeOne(panelNameMap, id), value: id })),
);
const contentComponent = computed(() => getRegionComponent(region, registry));
</script>

<template>
  <UiTabs
    v-if="region.panels.length > 1"
    :items="tabItems"
    :label="name"
    :model-value="region.activePanelId"
    is-filling
    :variant="UiTabsVariant.Header"
    flex-1
    min-h-0
    min-w-0
    @update:model-value="(panelId) => emit('selectPanel', panelId)"
  >
    <component :is="contentComponent" v-if="contentComponent" />
  </UiTabs>
  <component :is="contentComponent" v-else-if="contentComponent" />
</template>
