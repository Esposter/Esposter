<script setup lang="ts">
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { KeyAction } from "@/models/pageBuilder/KeyAction";
import { KeyScope } from "@/models/pageBuilder/KeyScope";
import { getKeyAction } from "@/services/pageBuilder/getKeyAction";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";

interface Props {
  announce: (message: string) => void;
  dropTarget?: DropTarget;
  resourceId: string;
}

const { announce, dropTarget, resourceId } = defineProps<Props>();
const emit = defineEmits<{ canvasKeydown: [event: KeyboardEvent] }>();
const { origin } = useRequestURL();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument, getKind } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice, getEditingNodeId, getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
const pageBuilderHistoryStore = usePageBuilderHistoryStore();
const { getPreview } = pageBuilderHistoryStore;
const pageDocument = computed(() => getDocument(resourceId));
const pageKind = computed(() => getKind(resourceId));
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
const { checkIsHorizontalOwner, getElement, getFrameGeometry, toolbarPosition } = usePageBuilderFrame(
  contentRoot,
  hoveredNodeId,
  selectionBox,
);
const { selectAdjacentNode, selectParent } = usePageBuilderSelection(() => resourceId);
// The node element the editor is mounted in, found once the draw has put it in the frame
const editingElement = shallowRef<Element | null>(null);
watch(
  [editingNodeId, contentRoot, drawnDocument],
  ([nodeId]) => {
    editingElement.value = nodeId ? getElement(nodeId) : null;
  },
  { flush: "post" },
);
// The canvas takes its own keys, and forwards every other key to the editor
// A text edit's own keys stay with it, and a modified key keeps the meaning the editor gives it, so an Alt chord still moves the node
const onFrameKeydown = (event: KeyboardEvent) => {
  const action = getKeyAction(event, KeyScope.Canvas);
  if (!action) {
    emit("canvasKeydown", event);
    return;
  }

  event.preventDefault();
  if (action === KeyAction.ParentNode) selectParent();
  else selectAdjacentNode(action === KeyAction.NextNode ? 1 : -1);
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
// The style a drag is previewing is drawn over the document's, so the page follows the drag before it is recorded
const css = computed(() => {
  const document = getPreview(resourceId) ?? drawnDocument.value;
  if (!document) return "";

  const pageCss = getWebpageCss(document, getPresentDefinitions(document));
  return editingNodeId.value
    ? `${pageCss}\n[data-node-id="${CSS.escape(editingNodeId.value)}"] > :not([data-text-editor]) { display: none; }`
    : pageCss;
});
const device = computed(() => getDevice(resourceId));
// The nodes are rendered by the frame's content, so the render is a functional component over the document it draws
const CanvasNodes = (props: { document: WebpageDocument; kind: PageBuilderKind; origin: string }) =>
  renderCanvasVNodes(props.kind, props.document, { origin: props.origin });
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
      <CanvasNodes v-if="drawnDocument && pageKind" :document="drawnDocument" :kind="pageKind" :origin />
      <Teleport v-if="editingElement && editingNodeId" :to="editingElement">
        <PageBuilderCanvasTextEditor :key="editingNodeId" :node-id="editingNodeId" :resource-id />
      </Teleport>
      <PageBuilderCanvasOverlays
        v-model:selection-box="selectionBox"
        :check-is-horizontal-owner
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
