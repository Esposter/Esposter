<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { ResolvedRegion } from "vue-editor-layout-headless";

import { RegionEdgeDialogPlacementMap } from "@/services/editor/RegionEdgeDialogPlacementMap";
import { RegionEdgeOverlayClassMap } from "@/services/editor/RegionEdgeOverlayClassMap";
import { RegionEdge, RegionPresentation } from "vue-editor-layout-headless";

interface Props {
  // The name the region is announced by: its landmark's label, or a sheet's title
  name: string;
  // The name of each panel, keyed by panel id, which the tabs of a region holding several panels are titled by
  panelNameMap: Record<string, string>;
  region: ResolvedRegion;
  registry: EditorRegistry;
}

const { name, panelNameMap, region, registry } = defineProps<Props>();
// A docked region reports the size its handle asks for, a sheet asks to be opened or closed, and a tabbed region reports the
// Panel its reader picked, which the shell answers
const emit = defineEmits<{ resize: [size: number]; selectPanel: [panelId: string]; toggle: [] }>();
// A top or bottom region is a bar, sized by its height, and a start or end region a column, sized by its width
const isVertical = computed(() => [RegionEdge.Bottom, RegionEdge.Top].includes(region.edge));
// The handle sits on the region's inner edge, so a region at the end or the bottom takes it on its start or top side
const isReversed = computed(() => [RegionEdge.Bottom, RegionEdge.End].includes(region.edge));
// A handle moves a docked region between its limits, so equal limits leave it nothing to move
const isResizable = computed(
  () => region.presentation === RegionPresentation.Docked && region.minimumSize < region.maximumSize,
);
const sizeStyle = computed(() => (isVertical.value ? { height: `${region.size}px` } : { width: `${region.size}px` }));
</script>

<template>
  <UiDialog
    v-if="region.presentation === RegionPresentation.Sheet"
    :model-value="region.isOpen"
    :placement="RegionEdgeDialogPlacementMap[region.edge]"
    :title="name"
    is-title-hidden
    @update:model-value="emit('toggle')"
  >
    <EditorRegionContent
      :name
      :panel-name-map="panelNameMap"
      :region
      :registry
      @select-panel="(panelId) => emit('selectPanel', panelId)"
    />
  </UiDialog>
  <aside
    v-else
    :aria-label="name"
    :class="region.presentation === RegionPresentation.Overlay ? RegionEdgeOverlayClassMap[region.edge] : 'relative'"
    :style="sizeStyle"
    ui-frame
    flex
    flex-col
    min-h-0
    min-w-0
    shrink-0
  >
    <EditorRegionContent
      :name
      :panel-name-map="panelNameMap"
      :region
      :registry
      @select-panel="(panelId) => emit('selectPanel', panelId)"
    />
    <UiResizeHandle
      v-if="isResizable"
      :is-reversed="isReversed || undefined"
      :is-vertical="isVertical || undefined"
      :label="`Resize ${name}`"
      :max="region.maximumSize"
      :min="region.minimumSize"
      :model-value="region.size"
      @update:model-value="(newSize) => emit('resize', newSize)"
    />
  </aside>
</template>
