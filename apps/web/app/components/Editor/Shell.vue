<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { EditorType } from "@/models/editor/EditorType";
import type { Context, Layout } from "vue-editor-layout-headless";

import { useEditorReaderStateStore } from "@/store/editor/readerState";
import { takeOne } from "@esposter/shared";
import {
  parseReaderState,
  RegionEdge,
  RegionPresentation,
  SizeClass,
  useEditorLayout,
} from "vue-editor-layout-headless";

interface Props {
  // What the reader is doing, which decides what each panel shows
  context: Context;
  // The editor's type, which keys the reader state the shell keeps for it
  editorType: EditorType;
  layout: Layout;
  // The name of each side region, which its landmark or its sheet is announced by, keyed by region id
  regionNameMap: Record<string, string>;
  // The component each content key draws
  registry: EditorRegistry;
}

defineSlots<{ default: () => VNode }>();
const { context, editorType, layout, regionNameMap, registry } = defineProps<Props>();
const { isMobile, xs: isCompact } = useUiDisplay();
// The page's drawers are sheets below the mobile breakpoint, so that is the medium class, and a window below the first
// Breakpoint is the compact one
const sizeClass = computed(() => {
  if (isCompact.value) return SizeClass.Compact;
  else if (isMobile.value) return SizeClass.Medium;
  else return SizeClass.Expanded;
});
const editorReaderStateStore = useEditorReaderStateStore();
const { readerStateMap } = storeToRefs(editorReaderStateStore);
const { setReaderState } = editorReaderStateStore;
const { readerState, resizeRegion, resolvedLayout, toggleRegion } = useEditorLayout(
  () => layout,
  () => context,
  sizeClass,
  parseReaderState(layout, readerStateMap.value[editorType]),
);
// Every change to the reader's state is kept, so the next open of this editor type starts from it
watch(readerState, (newReaderState) => {
  setReaderState(editorType, newReaderState);
});
// A closed docked or overlay region draws nothing, while a sheet stays mounted closed so the reader can open it
const presentationRegionMap = computed(() =>
  Map.groupBy(
    resolvedLayout.value.regions.filter((region) => region.isOpen || region.presentation === RegionPresentation.Sheet),
    (region) => region.presentation,
  ),
);
const dockedEdgeRegionMap = computed(() =>
  Map.groupBy(presentationRegionMap.value.get(RegionPresentation.Docked) ?? [], (region) => region.edge),
);
// Each sheet is opened by a button the shell draws over the canvas, and it is drawn only while the sheet holds a panel
const sheetRegions = computed(() => presentationRegionMap.value.get(RegionPresentation.Sheet) ?? []);
// The control that opened the sheet, which takes focus back when the sheet closes. A modal sheet is the only one open at a
// Time, so one control is enough
const openerElement = shallowRef<HTMLElement>();
defineExpose({ toggleRegion });
</script>

<template>
  <div flex flex-col h-full min-h-0 min-w-0>
    <EditorRegion
      v-for="region in dockedEdgeRegionMap.get(RegionEdge.Top) ?? []"
      :key="region.id"
      :name="takeOne(regionNameMap, region.id)"
      :region
      :registry
      @resize="(newSize) => resizeRegion(region.id, newSize)"
    />
    <div flex flex-1 min-h-0 min-w-0>
      <EditorRegion
        v-for="region in dockedEdgeRegionMap.get(RegionEdge.Start) ?? []"
        :key="region.id"
        :name="takeOne(regionNameMap, region.id)"
        :region
        :registry
        @resize="(newSize) => resizeRegion(region.id, newSize)"
      />
      <div relative flex flex-1 flex-col min-h-0 min-w-0>
        <slot />
        <EditorRegion
          v-for="region in presentationRegionMap.get(RegionPresentation.Overlay) ?? []"
          :key="region.id"
          :name="takeOne(regionNameMap, region.id)"
          :region
          :registry
        />
        <!-- Drawn out of the flow, so a selection that shows a button does not push the canvas down -->
        <div v-if="sheetRegions.length" absolute right-0 top-0 z-10 p-1 flex gap-1>
          <UiButton
            v-for="region in sheetRegions"
            :key="region.id"
            :aria-expanded="region.isOpen"
            aria-haspopup="dialog"
            @click="
              (event: MouseEvent) => {
                if (event.currentTarget instanceof HTMLElement) openerElement = event.currentTarget;
                toggleRegion(region.id);
              }
            "
          >
            {{ takeOne(regionNameMap, region.id) }}
          </UiButton>
        </div>
      </div>
      <EditorRegion
        v-for="region in dockedEdgeRegionMap.get(RegionEdge.End) ?? []"
        :key="region.id"
        :name="takeOne(regionNameMap, region.id)"
        :region
        :registry
        @resize="(newSize) => resizeRegion(region.id, newSize)"
      />
    </div>
    <EditorRegion
      v-for="region in dockedEdgeRegionMap.get(RegionEdge.Bottom) ?? []"
      :key="region.id"
      :name="takeOne(regionNameMap, region.id)"
      :region
      :registry
      @resize="(newSize) => resizeRegion(region.id, newSize)"
    />
    <!-- A sheet closes from its own close button or Escape, and its control takes focus only once the close has drawn, since the
      Open modal leaves that control inert until then -->
    <EditorRegion
      v-for="region in sheetRegions"
      :key="region.id"
      :name="takeOne(regionNameMap, region.id)"
      :region
      :registry
      @toggle="
        async () => {
          toggleRegion(region.id);
          await nextTick();
          openerElement?.focus();
        }
      "
    />
  </div>
</template>
