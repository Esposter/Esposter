<script setup lang="ts">
import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { DropIndicator } from "@/models/pageBuilder/DropIndicator";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { DropIndicatorKind } from "@/models/pageBuilder/DropIndicatorKind";
import { getDropIndicatorBox } from "@/services/pageBuilder/getDropIndicatorBox";
import { getOverlayBox } from "@/services/pageBuilder/getOverlayBox";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { getSlotOwnerId } from "@/services/pageBuilder/getSlotOwnerId";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  checkIsHorizontalOwner: (ownerId: string) => boolean;
  dropTarget?: DropTarget;
  getElement: (nodeId: string) => Element | null;
  hoveredNodeId?: string;
  resourceId: string;
  selectedNodeId: string;
}

const { checkIsHorizontalOwner, dropTarget, getElement, hoveredNodeId, resourceId, selectedNodeId } =
  defineProps<Props>();
// The box of the selected node, kept for the node toolbar placed in the app's own document
const selectionBox = defineModel<OverlayBox>("selectionBox");
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
const pageOpen = computed(() => getHeldDocument(resourceId));
const layer = useTemplateRef("layer");
const hoverBox = shallowRef<OverlayBox>();
const dropIndicator = shallowRef<DropIndicator>();
// The style that places a box over the layer, for every box the layer draws
const toBoxStyle = ({ height, left, top, width }: OverlayBox) => ({
  height: `${height}px`,
  left: `${left}px`,
  top: `${top}px`,
  width: `${width}px`,
});
// The drop indicator's box as the style that places it over the layer, whichever of its two kinds draws it
const dropIndicatorStyle = computed(() => (dropIndicator.value ? toBoxStyle(dropIndicator.value.box) : undefined));
let pendingFrame = 0;
// The box of a node's element inside the layer, or none when the node has no element in the frame
const getNodeBox = (nodeId: string | undefined): OverlayBox | undefined => {
  if (!nodeId || !layer.value) return undefined;

  const element = getElement(nodeId);
  if (!element) return undefined;

  return getOverlayBox(element.getBoundingClientRect(), layer.value.getBoundingClientRect());
};
// The box an empty slot's indicator outlines: the node holding the slot, or the whole layer when the slot is the page's content
const getSlotOwnerBox = (
  kind: AnyPageBuilderKind,
  document: AnyPageBuilderDocument,
  slotPointer: string,
): OverlayBox | undefined => {
  if (slotPointer === "/content") {
    const layerRect = layer.value?.getBoundingClientRect();
    return layerRect === undefined ? undefined : { height: layerRect.height, left: 0, top: 0, width: layerRect.width };
  }

  return getNodeBox(getSlotOwnerId(kind, document, slotPointer));
};
// The indicator of the drop target, drawn among the boxes of its slot's children that are in the frame
const getDropIndicator = (): DropIndicator | undefined => {
  const open = pageOpen.value;
  if (!dropTarget || !open) return undefined;
  // The shell reads a document of either kind through the kind any of them assigns to, so the pair is typed as that
  const document: AnyPageBuilderDocument = open.document;
  const kind: AnyPageBuilderKind = open.kind;
  const childBoxes = getSlotChildIds(kind, document, dropTarget.slotPointer).map((childId) => getNodeBox(childId));
  return getDropIndicatorBox({
    childBoxes,
    index: dropTarget.index,
    isHorizontal: checkIsHorizontalOwner(getSlotOwnerId(kind, document, dropTarget.slotPointer)),
    ownerBox: getSlotOwnerBox(kind, document, dropTarget.slotPointer),
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
watch([() => hoveredNodeId, () => selectedNodeId, () => dropTarget, pageOpen], scheduleRedraw, { flush: "post" });
onMounted(scheduleRedraw);
onScopeDispose(() => cancelAnimationFrame(pendingFrame));
</script>

<!-- The layer covers the content it outlines, so its own box is the box the outlines are placed in -->
<template>
  <div ref="layer" pointer-events-none inset-0 absolute>
    <div
      v-if="hoverBox"
      data-outline="hover"
      outline-1
      outline-current
      outline-solid
      op-50
      absolute
      :style="toBoxStyle(hoverBox)"
    />
    <div
      v-if="dropIndicator?.kind === DropIndicatorKind.Line"
      data-drop-indicator="line"
      bg-current
      absolute
      :style="dropIndicatorStyle"
    />
    <div
      v-if="dropIndicator?.kind === DropIndicatorKind.Outline"
      data-drop-indicator="outline"
      b-2
      b-current
      b-dashed
      absolute
      :style="dropIndicatorStyle"
    />
    <div
      v-if="selectionBox"
      data-outline="selection"
      outline-1
      outline-white
      outline-solid
      b-2
      b-current
      b-solid
      absolute
      :style="toBoxStyle(selectionBox)"
    />
  </div>
</template>
