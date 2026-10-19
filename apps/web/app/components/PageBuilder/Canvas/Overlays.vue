<script setup lang="ts">
import type { OverlayBox } from "@/services/pageBuilder/getOverlayBox";

import { getOverlayBox } from "@/services/pageBuilder/getOverlayBox";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  getElement: (nodeId: string) => Element | null;
  hoveredNodeId?: string;
  resourceId: string;
  selectedNodeId: string;
}

const { getElement, hoveredNodeId, resourceId, selectedNodeId } = defineProps<Props>();
// The box of the selected node, kept for the node toolbar placed in the app's own document
const selectionBox = defineModel<OverlayBox>("selectionBox");
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
const layer = useTemplateRef("layer");
const hoverBox = shallowRef<OverlayBox>();
let pendingFrame = 0;

// The box of a node's element inside the layer, or none when the node has no element in the frame
const getNodeBox = (nodeId: string | undefined): OverlayBox | undefined => {
  if (!nodeId || !layer.value) return undefined;

  const element = getElement(nodeId);
  if (!element) return undefined;

  return getOverlayBox(element.getBoundingClientRect(), layer.value.getBoundingClientRect());
};
const redraw = () => {
  hoverBox.value = getNodeBox(hoveredNodeId);
  selectionBox.value = getNodeBox(selectedNodeId);
};
// One redraw per animation frame, however many scrolls, resizes or patches land before it
const scheduleRedraw = () => {
  cancelAnimationFrame(pendingFrame);
  pendingFrame = requestAnimationFrame(redraw);
};

useEventListener(() => layer.value?.ownerDocument.defaultView, "scroll", scheduleRedraw, { passive: true });
useResizeObserver(() => layer.value?.ownerDocument.body, scheduleRedraw);
watch([() => hoveredNodeId, () => selectedNodeId, pageDocument], scheduleRedraw, { flush: "post" });
onMounted(scheduleRedraw);
onScopeDispose(() => cancelAnimationFrame(pendingFrame));
</script>

<!-- The layer covers the content it outlines, so its own box is the box the outlines are placed in -->
<template>
  <div ref="layer" absolute inset-0 pointer-events-none>
    <div
      v-if="hoverBox"
      data-outline="hover"
      absolute
      outline-1
      outline-solid
      outline-current
      op-50
      :style="{
        height: `${hoverBox.height}px`,
        left: `${hoverBox.left}px`,
        top: `${hoverBox.top}px`,
        width: `${hoverBox.width}px`,
      }"
    />
    <div
      v-if="selectionBox"
      data-outline="selection"
      absolute
      border-2
      border-solid
      border-current
      outline-1
      outline-solid
      outline-white
      :style="{
        height: `${selectionBox.height}px`,
        left: `${selectionBox.left}px`,
        top: `${selectionBox.top}px`,
        width: `${selectionBox.width}px`,
      }"
    />
  </div>
</template>
