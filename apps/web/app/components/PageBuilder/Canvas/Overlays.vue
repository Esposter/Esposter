<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { DropIndicator } from "@/models/pageBuilder/DropIndicator";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { DropIndicatorKind } from "@/models/pageBuilder/DropIndicatorKind";
import { getDropIndicatorBox } from "@/services/pageBuilder/getDropIndicatorBox";
import { getOverlayBox } from "@/services/pageBuilder/getOverlayBox";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { getSlotOwnerPointer } from "@/services/pageBuilder/getSlotOwnerPointer";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { getBlockNode } from "headless-block-editor";

interface Props {
  dropTarget?: DropTarget;
  getElement: (nodeId: string) => Element | null;
  hoveredNodeId?: string;
  resourceId: string;
  selectedNodeId: string;
}

const { dropTarget, getElement, hoveredNodeId, resourceId, selectedNodeId } = defineProps<Props>();
// The box of the selected node, kept for the node toolbar placed in the app's own document
const selectionBox = defineModel<OverlayBox>("selectionBox");
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
const layer = useTemplateRef("layer");
const hoverBox = shallowRef<OverlayBox>();
const dropIndicator = shallowRef<DropIndicator>();
let pendingFrame = 0;

// The box of a node's element inside the layer, or none when the node has no element in the frame
const getNodeBox = (nodeId: string | undefined): OverlayBox | undefined => {
  if (!nodeId || !layer.value) return undefined;

  const element = getElement(nodeId);
  if (!element) return undefined;

  return getOverlayBox(element.getBoundingClientRect(), layer.value.getBoundingClientRect());
};
// The box an empty slot's indicator outlines: the node holding the slot, or the whole layer when the slot is the page's content
const getSlotOwnerBox = (document: WebpageDocument, slotPointer: string): OverlayBox | undefined => {
  if (slotPointer === "/content") {
    const layerRect = layer.value?.getBoundingClientRect();
    return layerRect === undefined ? undefined : { height: layerRect.height, left: 0, top: 0, width: layerRect.width };
  }

  return getNodeBox(getBlockNode(document, getSlotOwnerPointer(slotPointer), webpageNodeChildren)?.props.id);
};
// The indicator of the drop target, drawn among the boxes of its slot's children that are in the frame
const getDropIndicator = (): DropIndicator | undefined => {
  const document = pageDocument.value;
  if (!dropTarget || !document) return undefined;

  const childBoxes = getSlotChildIds(document, dropTarget.slotPointer).map((childId) => getNodeBox(childId));
  return getDropIndicatorBox({
    childBoxes,
    index: dropTarget.index,
    ownerBox: getSlotOwnerBox(document, dropTarget.slotPointer),
  });
};
const redraw = () => {
  hoverBox.value = getNodeBox(hoveredNodeId);
  selectionBox.value = getNodeBox(selectedNodeId);
  dropIndicator.value = getDropIndicator();
};
// One redraw per animation frame, however many scrolls, resizes or patches land before it
const scheduleRedraw = () => {
  cancelAnimationFrame(pendingFrame);
  pendingFrame = requestAnimationFrame(redraw);
};

useEventListener(() => layer.value?.ownerDocument.defaultView, "scroll", scheduleRedraw, { passive: true });
useResizeObserver(() => layer.value?.ownerDocument.body, scheduleRedraw);
watch([() => hoveredNodeId, () => selectedNodeId, () => dropTarget, pageDocument], scheduleRedraw, { flush: "post" });
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
      v-if="dropIndicator?.kind === DropIndicatorKind.Line"
      data-drop-indicator="line"
      absolute
      bg-current
      :style="{
        height: `${dropIndicator.box.height}px`,
        left: `${dropIndicator.box.left}px`,
        top: `${dropIndicator.box.top}px`,
        width: `${dropIndicator.box.width}px`,
      }"
    />
    <div
      v-if="dropIndicator?.kind === DropIndicatorKind.Outline"
      data-drop-indicator="outline"
      absolute
      border-2
      border-dashed
      border-current
      :style="{
        height: `${dropIndicator.box.height}px`,
        left: `${dropIndicator.box.left}px`,
        top: `${dropIndicator.box.top}px`,
        width: `${dropIndicator.box.width}px`,
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
