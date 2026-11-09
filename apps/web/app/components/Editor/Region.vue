<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { ResolvedRegion } from "vue-editor-layout-headless";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { RegionEdgeDialogPlacementMap } from "@/services/editor/RegionEdgeDialogPlacementMap";
import { RegionEdgeOverlayClassMap } from "@/services/editor/RegionEdgeOverlayClassMap";
import { RegionEdge, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

interface Props {
  // The name the region is announced by: its landmark's label, or a sheet's title
  name: string;
  // The space the open overlay bars take at the top and bottom of the canvas. An overlay column starts below the top bars
  // And ends above the bottom ones, so it never claims a corner a bar claims. Any other region takes no inset
  overlayInset?: { bottom: number; top: number };
  // The name of each panel, keyed by panel id, which the tabs of a region holding several panels are titled by
  panelNameMap: Record<string, string>;
  region: ResolvedRegion;
  registry: EditorRegistry;
}

const { name, overlayInset, panelNameMap, region, registry } = defineProps<Props>();
// A docked region reports the size its handle asks for, a sheet asks to be opened or closed, and a tabbed region reports the
// Panel its reader picked, which the shell answers
const emit = defineEmits<{ resize: [size: number]; selectPanel: [panelId: string]; toggle: [] }>();
const sizeClass = useEditorSizeClass();
// A compact window is a phone, whose drawer would cover the whole canvas, so its sheet rises from the bottom and leaves the
// Canvas in view above it. A wider window's sheet stands at its region's own edge
const sheetPlacement = computed(() =>
  sizeClass.value === SizeClass.Compact ? UiDialogPlacement.DrawerBottom : RegionEdgeDialogPlacementMap[region.edge],
);
// A top or bottom region is a bar, sized by its height, and a start or end region a column, sized by its width
const isVertical = computed(() => [RegionEdge.Bottom, RegionEdge.Top].includes(region.edge));
// The handle sits on the region's inner edge, so a region at the end or the bottom takes it on its start or top side
const isReversed = computed(() => [RegionEdge.Bottom, RegionEdge.End].includes(region.edge));
// A handle moves a docked region between its limits, so equal limits leave it nothing to move
const isResizable = computed(
  () => region.presentation === RegionPresentation.Docked && region.minimumSize < region.maximumSize,
);
// A region tabbed by its panels scrolls inside the panel it shows, so its wrapper only clips. Any other region's wrapper is
// Its body, full-bleed in every orientation: each panel pads what it draws, so the body that holds it adds no padding
const regionBodyClass = computed(() => (region.panels.length > 1 ? "of-hidden" : "ui-region-body"));
const sizeStyle = computed(() => (isVertical.value ? { height: `${region.size}px` } : { width: `${region.size}px` }));
// An inline inset beats the `inset-y-0` class the overlay map gives a column, so that map stays as it is
const overlayInsetStyle = computed(() => {
  if (region.presentation !== RegionPresentation.Overlay || isVertical.value || !overlayInset) return {};
  return { bottom: `${overlayInset.bottom}px`, top: `${overlayInset.top}px` };
});
</script>

<template>
  <UiDialog
    v-if="region.presentation === RegionPresentation.Sheet"
    :model-value="region.isOpen"
    is-body-bare
    :placement="sheetPlacement"
    :title="name"
    is-title-hidden
    @update:model-value="emit('toggle')"
  >
    <EditorRegionContent
      :name
      :panel-name-map
      :region
      :registry
      @select-panel="(panelId) => emit('selectPanel', panelId)"
    />
  </UiDialog>
  <aside
    v-else
    :aria-label="name"
    :class="region.presentation === RegionPresentation.Overlay ? RegionEdgeOverlayClassMap[region.edge] : 'relative'"
    :style="[sizeStyle, overlayInsetStyle]"
    flex
    shrink-0
    flex-col
    min-h-0
    min-w-0
    ui-frame
  >
    <!-- Content taller than its region scrolls inside it, so it never paints over the canvas or a column beside it. A region
         tabbed by its panels scrolls in the selected panel instead, so this wrapper only clips. The handle sits outside,
         since it straddles the region's edge -->
    <div flex flex-1 flex-col min-h-0 min-w-0 :class="regionBodyClass">
      <EditorRegionContent
        :name
        :panel-name-map
        :region
        :registry
        @select-panel="(panelId) => emit('selectPanel', panelId)"
      />
    </div>
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
