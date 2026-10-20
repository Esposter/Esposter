<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { CanvasKeyAction } from "@/models/pageBuilder/CanvasKeyAction";
import { getCanvasKeyAction } from "@/services/pageBuilder/getCanvasKeyAction";
import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getParentNodeId } from "@/services/pageBuilder/getParentNodeId";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { getAdjacentBlockNodePointer, getBlockLayerRows } from "headless-block-editor";
import { getFrameScale } from "vue-canvas-frame-headless";

interface Props {
  announce: (message: string) => void;
  dropTarget?: DropTarget;
  resourceId: string;
}

const { announce, dropTarget, resourceId } = defineProps<Props>();
const emit = defineEmits<{ canvasKeydown: [event: KeyboardEvent] }>();
const { origin } = useRequestURL();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice, getEditingNodeId, getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
const pageDocument = computed(() => getDocument(resourceId));
const selectedNodeId = computed(() => getSelectedNodeId(resourceId));
const editingNodeId = computed(() => getEditingNodeId(resourceId));
// The document the frame draws. While a text node is edited it stays as it was when the edit began.
// Otherwise each change would reset the node's rendered html, which the editor is mounted inside
const drawnDocument = shallowRef<WebpageDocument>();
watchImmediate([pageDocument, editingNodeId], ([document, nodeId]) => {
  if (!nodeId) drawnDocument.value = document;
});
const contentRoot = useTemplateRef("contentRoot");
// The node under the pointer, held here rather than in the store since only this canvas outlines it
const hoveredNodeId = ref("");
const selectionBox = ref<OverlayBox>();
const getElement = (nodeId: string) =>
  contentRoot.value?.ownerDocument.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`) ?? null;
// The node element the editor is mounted in, found once the draw has put it in the frame
const editingElement = shallowRef<Element | null>(null);
watch(
  [editingNodeId, contentRoot, drawnDocument],
  ([nodeId]) => {
    editingElement.value = nodeId ? getElement(nodeId) : null;
  },
  { flush: "post" },
);
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
// What a palette drag reads of the frame, taken fresh at each call. A child's box is its raw viewport rect in the frame.
// That is the same space the pointer is mapped into, so the drop logic is not offset by the frame's own scroll
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
// Up and Down select the adjacent node in document order, starting from the first node when none is selected, and stay put past either end
const selectAdjacentNode = (offset: number) => {
  const document = pageDocument.value;
  if (!document) return;

  const nodeId = getSelectedNodeId(resourceId);
  const nodePointer = nodeId ? getNodePointer(document, nodeId) : undefined;
  const adjacentPointer =
    nodePointer === undefined
      ? getBlockLayerRows(document, webpageNodeChildren)[0]?.nodePointer
      : getAdjacentBlockNodePointer(document, webpageNodeChildren, nodePointer, offset);
  const adjacentId = adjacentPointer === undefined ? "" : getNodeIdAt(document, adjacentPointer);
  if (adjacentId) setSelectedNodeId(resourceId, adjacentId);
};
const selectParent = () => {
  const document = pageDocument.value;
  if (!document) return;

  const parentId = getParentNodeId(document, getSelectedNodeId(resourceId));
  setSelectedNodeId(resourceId, parentId ?? "");
};
// The canvas takes its own keys, and forwards every other key to the editor
// A text edit's own keys stay with it, and a modified key keeps the meaning the editor gives it, so an Alt chord still moves the node
const onFrameKeydown = (event: KeyboardEvent) => {
  if (checkIsEditableTarget(event.target)) return;

  const action = event.altKey || event.ctrlKey || event.metaKey ? undefined : getCanvasKeyAction(event.key);
  if (!action) {
    emit("canvasKeydown", event);
    return;
  }

  event.preventDefault();
  if (action === CanvasKeyAction.Parent) selectParent();
  else selectAdjacentNode(action === CanvasKeyAction.Next ? 1 : -1);
};
// The frame's document is the one the keys are pressed in, so its listener is attached once the page is drawn in it and removed with it
watch(contentRoot, (element, _previousElement, onCleanup) => {
  const frameDocument = element?.ownerDocument;
  if (!frameDocument) return;

  frameDocument.addEventListener("keydown", onFrameKeydown);
  onCleanup(() => frameDocument.removeEventListener("keydown", onFrameKeydown));
});
defineExpose({ getFrameGeometry });
// While a text node is edited, its rendered content is hidden in the frame: the editor is mounted beside it inside the node
const css = computed(() => {
  const document = drawnDocument.value;
  if (!document) return "";

  const pageCss = getWebpageCss(document, getPresentDefinitions(document));
  return editingNodeId.value
    ? `${pageCss}\n[data-node-id="${CSS.escape(editingNodeId.value)}"] > :not([data-text-editor]) { display: none; }`
    : pageCss;
});
const device = computed(() => getDevice(resourceId));
// The nodes are rendered by the frame's content, so the render is a functional component over the document it draws
const CanvasNodes = (props: { document: WebpageDocument; origin: string }) =>
  renderCanvasVNodes(props.document, { origin: props.origin });
</script>

<template>
  <PageBuilderCanvasFrame v-if="pageDocument" :css :device tabindex="0" aria-label="Canvas of the page" title="Page">
    <div
      ref="contentRoot"
      relative
      @click="setSelectedNodeId(resourceId, getNodeIdFromElement($event.target) ?? '')"
      @pointerleave="hoveredNodeId = ''"
      @pointerover="hoveredNodeId = getNodeIdFromElement($event.target) ?? ''"
    >
      <CanvasNodes v-if="drawnDocument" :document="drawnDocument" :origin />
      <Teleport v-if="editingElement && editingNodeId" :to="editingElement">
        <PageBuilderCanvasTextEditor :key="editingNodeId" :node-id="editingNodeId" :resource-id />
      </Teleport>
      <PageBuilderCanvasOverlays
        v-model:selection-box="selectionBox"
        :get-element
        :drop-target
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
