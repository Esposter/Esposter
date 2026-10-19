<script setup lang="ts">
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { OverlayBox } from "@/services/pageBuilder/getOverlayBox";
import type { DropTarget } from "@/services/pageBuilder/resolveDropTarget";

import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { getFrameScale } from "vue-canvas-frame-headless";

interface Props {
  announce: (message: string) => void;
  dropTarget?: DropTarget;
  resourceId: string;
}

const { announce, dropTarget, resourceId } = defineProps<Props>();
const { origin } = useRequestURL();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
const selectedNodeId = computed(() => pageBuilderCanvasStore.getSelectedNodeId(resourceId));
const contentRoot = useTemplateRef("contentRoot");
// The node under the pointer, held here rather than in the store since only this canvas outlines it
const hoveredNodeId = ref<string>();
const selectionBox = ref<OverlayBox>();
const getElement = (nodeId: string) =>
  contentRoot.value?.ownerDocument.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`) ?? null;
const getFrameElement = () => {
  const frameElement = contentRoot.value?.ownerDocument.defaultView?.frameElement;
  return frameElement instanceof HTMLIFrameElement ? frameElement : undefined;
};
// The frame is scaled to fit its pane, so the scale maps the frame's own pixels to the app's viewport
const getFrameScaleOf = (frameElement: HTMLIFrameElement) =>
  getFrameScale(frameElement.parentElement?.clientWidth ?? 0, frameElement.offsetWidth);
// The toolbar sits in the app's document, so the selection box is mapped into the app's viewport through the frame's element
// The frame is scaled to fit its pane while the box is in the frame's own unscaled pixels, so the scale applies to the box
const toolbarPosition = computed(() => {
  const frameElement = getFrameElement();
  if (!frameElement || !selectionBox.value) return undefined;

  const scale = getFrameScaleOf(frameElement);
  const frameRect = frameElement.getBoundingClientRect();
  return {
    left: frameRect.left + selectionBox.value.left * scale,
    top: frameRect.top + selectionBox.value.top * scale,
  };
});
// What a palette drag reads of the frame, taken fresh at each call. A child's box is its raw viewport rect in the frame, the
// Same space the pointer is mapped into, so the drop logic is not offset by the frame's own scroll
const getFrameGeometry = (): FrameGeometry | undefined => {
  const frameElement = getFrameElement();
  if (!frameElement) return undefined;

  const frameRect = frameElement.getBoundingClientRect();
  return {
    frameRect: { height: frameRect.height, left: frameRect.left, top: frameRect.top, width: frameRect.width },
    getChildRect: (nodeId) => getElement(nodeId)?.getBoundingClientRect(),
    hoveredNodeId: hoveredNodeId.value,
    scale: getFrameScaleOf(frameElement),
  };
};
defineExpose({ getFrameGeometry });
const css = computed(() =>
  pageDocument.value ? getWebpageCss(pageDocument.value, getPresentDefinitions(pageDocument.value)) : "",
);
const device = computed(() => pageBuilderCanvasStore.getDevice(resourceId));
// The nodes are rendered by the frame's content, so the render is a functional component over the document it draws
const CanvasNodes = (props: { document: WebpageDocument; origin: string }) =>
  renderCanvasVNodes(props.document, { origin: props.origin });
</script>

<template>
  <PageBuilderCanvasFrame v-if="pageDocument" :css :device title="Page">
    <div
      ref="contentRoot"
      relative
      @click="
        pageBuilderCanvasStore.setSelectedNodeId(
          resourceId,
          getNodeIdFromElement($event.target as Element | null) ?? '',
        )
      "
      @pointerleave="hoveredNodeId = undefined"
      @pointerover="hoveredNodeId = getNodeIdFromElement($event.target as Element | null)"
    >
      <CanvasNodes :document="pageDocument" :origin />
      <PageBuilderCanvasOverlays
        v-model:selection-box="selectionBox"
        :get-element
        :drop-target="dropTarget"
        :hovered-node-id
        :resource-id
        :selected-node-id
      />
    </div>
  </PageBuilderCanvasFrame>
  <PageBuilderCanvasNodeToolbar
    v-if="selectedNodeId && toolbarPosition"
    :announce
    :position="toolbarPosition"
    :resource-id
  />
</template>
