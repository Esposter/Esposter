<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { ResolvedRegion } from "vue-editor-layout-headless";

import { getRegionComponent } from "@/services/editor/getRegionComponent";
import { RegionEdgeDialogPlacementMap } from "@/services/editor/RegionEdgeDialogPlacementMap";
import { RegionEdgeOverlayClassMap } from "@/services/editor/RegionEdgeOverlayClassMap";
import { RegionEdge, RegionPresentation } from "vue-editor-layout-headless";

interface Props {
  // The name the region is announced by: its landmark's label, or a sheet's title
  name: string;
  region: ResolvedRegion;
  registry: EditorRegistry;
}

const { name, region, registry } = defineProps<Props>();
// A docked region reports the size its handle asks for, and a sheet asks to be opened or closed, which the shell answers
const emit = defineEmits<{ resize: [size: number]; toggle: [] }>();
// A top or bottom region is a bar, sized by its height, and a start or end region a column, sized by its width
const isVertical = computed(() => [RegionEdge.Bottom, RegionEdge.Top].includes(region.edge));
// The handle sits on the region's inner edge, so a region at the end or the bottom takes it on its start or top side
const isReversed = computed(() => [RegionEdge.Bottom, RegionEdge.End].includes(region.edge));
const sizeStyle = computed(() => (isVertical.value ? { height: `${region.size}px` } : { width: `${region.size}px` }));
const contentComponent = computed(() => getRegionComponent(region, registry));
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
    <component :is="contentComponent" v-if="contentComponent" />
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
    <component :is="contentComponent" v-if="contentComponent" />
    <UiResizeHandle
      v-if="region.presentation === RegionPresentation.Docked"
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
