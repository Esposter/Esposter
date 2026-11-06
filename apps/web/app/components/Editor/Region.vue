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
// A sheet asks to be opened or closed, which the shell answers by toggling the region
const emit = defineEmits<{ toggle: [] }>();
// A top or bottom region is a bar, sized by its height, and a start or end region a column, sized by its width
const isVertical = computed(() => [RegionEdge.Bottom, RegionEdge.Top].includes(region.edge));
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
  </aside>
</template>
