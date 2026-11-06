<script setup lang="ts">
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { UiCommand } from "@/models/ui/UiCommand";
import type { OpenPageBuilderDocument } from "@/store/pageBuilder/document";
import type { BlockNode } from "vue-block-editor-headless";

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DESKTOP_MIN_WIDTH, DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { renderEmailCanvasVNodes } from "@/services/pageBuilder/email/renderEmailCanvasVNodes";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { DRAG_PREVIEW_NODE_ID, withDragPreview } from "@/services/pageBuilder/withDragPreview";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { ResourceType } from "@esposter/db-schema";

interface Props {
  announce: (message: string) => void;
  // The palette block type being dragged, which the canvas draws in the slot its drop target names
  draggedType?: BlockNode["type"];
  dropTarget?: DropTarget;
  // The kind the resource's document is drawn through, which the shell passes beside the resource
  kind: AnyPageBuilderKind;
  resourceId: string;
}

const isDeleteOpen = defineModel<boolean>("isDeleteOpen", { default: false });
const { announce, draggedType, dropTarget, kind, resourceId } = defineProps<Props>();
const emit = defineEmits<{ canvasKeydown: [event: KeyboardEvent] }>();
const { origin } = useRequestURL();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice, getEditingNodeId, getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
const pageBuilderHistoryStore = usePageBuilderHistoryStore();
const { getPreview } = pageBuilderHistoryStore;
const pageOpen = computed(() => getHeldDocument(resourceId));
const pageDocument = computed(() => pageOpen.value?.document);
const selectedNodeId = computed(() => getSelectedNodeId(resourceId));
const editingNodeId = computed(() => getEditingNodeId(resourceId));
// The document the frame draws. While a text node is edited it stays as it was when the edit began.
// Otherwise each change would reset the node's rendered html, which the editor is mounted inside
const drawnOpen = shallowRef<OpenPageBuilderDocument>();
watchImmediate([pageOpen, editingNodeId], ([open, nodeId]) => {
  if (!nodeId) drawnOpen.value = open;
});
// A palette block being dragged is drawn in the slot it would land in, so the page previews the drop. The preview is derived
// Here, so the store and its history never hold it
const renderedOpen = computed((): OpenPageBuilderDocument | undefined => {
  const open = drawnOpen.value;
  if (!open || draggedType === undefined || !dropTarget) return open;

  return open.type === ResourceType.Email
    ? { ...open, document: withDragPreview(open.kind, open.document, draggedType, dropTarget) }
    : { ...open, document: withDragPreview(open.kind, open.document, draggedType, dropTarget) };
});
const contentRoot = useTemplateRef("contentRoot");
// The node under the pointer, held here rather than in the store since only this canvas outlines it
const hoveredNodeId = ref("");
const selectionBox = ref<OverlayBox>();
const { checkIsHorizontalOwner, getElement, getFrameGeometry, toolbarPosition } = usePageBuilderFrame(
  contentRoot,
  selectionBox,
);
const { selectAdjacentNode, selectParent } = usePageBuilderSelection(
  kind,
  () => pageDocument.value,
  () => resourceId,
);
// The node element the editor is mounted in, found once the draw has put it in the frame
const editingElement = shallowRef<Element | null>(null);
watch(
  [editingNodeId, contentRoot, drawnOpen],
  ([nodeId]) => {
    editingElement.value = nodeId ? getElement(nodeId) : null;
  },
  { flush: "post" },
);
// The arrows and Escape, unmodified, are the canvas's own: the next node, the previous one and the parent. Every other key is
// Handed to the editor, and a text edit's own keys stay with it, so an Alt chord still reaches the editor's commands
const frameKeyActions: Partial<Record<string, () => void>> = {
  ArrowDown: () => selectAdjacentNode(1),
  ArrowUp: () => selectAdjacentNode(-1),
  Escape: selectParent,
};
// Listed in the shortcuts dialog and never bound, since the arrows also walk the layers tree and the palette, so only the frame takes them
useCommands((): UiCommand[] => [
  {
    group: PAGE_BUILDER_COMMAND_GROUP,
    id: "page-builder-next-node",
    meaning: UiIconMeaning.ArrowDown,
    shortcut: "arrowdown",
    title: "Select the next block",
  },
  {
    group: PAGE_BUILDER_COMMAND_GROUP,
    id: "page-builder-previous-node",
    meaning: UiIconMeaning.ArrowUp,
    shortcut: "arrowup",
    title: "Select the previous block",
  },
  {
    group: PAGE_BUILDER_COMMAND_GROUP,
    id: "page-builder-parent-node",
    meaning: UiIconMeaning.Collapse,
    shortcut: "escape",
    title: "Select the parent block",
  },
]);
const onFrameKeydown = (event: KeyboardEvent) => {
  if (checkIsEditableTarget(event.target)) return;

  const frameKeyAction = frameKeyActions[event.key];
  if (!frameKeyAction || event.altKey || event.ctrlKey || event.metaKey) {
    emit("canvasKeydown", event);
    return;
  }

  event.preventDefault();
  frameKeyAction();
};
// The frame's document is the one the keys are pressed in, so its listener follows the content root drawn in it
useEventListener(() => contentRoot.value?.ownerDocument, "keydown", onFrameKeydown);
defineExpose({ getFrameGeometry });
// While a text node is edited, its rendered content is hidden in the frame: the editor is mounted beside it inside the node
// The style a drag is previewing is drawn over the document's, so the page follows the drag before it is recorded
// An email is drawn with the inline styles MJML writes, so only a webpage has a sheet of its own to draw. The drag preview's rule
// Is in either sheet, since its node is drawn in either document
const css = computed(() => {
  // An empty block has no height to outline, so the preview gets a minimum one. Its pointer events pass through it, so hover and
  // Hit-testing reach the node it sits in, and it is faded so it reads as a preview
  const previewCss = `[data-node-id="${DRAG_PREVIEW_NODE_ID}"] { min-height: 2.5rem; opacity: 0.5; pointer-events: none; }`;
  const open = drawnOpen.value;
  if (open?.type !== ResourceType.Webpage) return previewCss;

  const document = getPreview(resourceId) ?? open.document;
  const pageCss = getWebpageCss(document, getPresentDefinitions(document));
  const editingCss = editingNodeId.value
    ? `\n[data-node-id="${CSS.escape(editingNodeId.value)}"] > :not([data-text-editor]) { display: none; }`
    : "";
  return `${pageCss}${editingCss}\n${previewCss}`;
});
const device = computed(() => getDevice(resourceId));
// An email is drawn at the width of its device, in the column an email is read in, which the body-width wrapper gives it
const emailWidth = computed(() =>
  device.value === PageBuilderDevice.Desktop ? DESKTOP_MIN_WIDTH : DEVICE_WIDTH_MAP[device.value],
);
// The nodes are rendered by the frame's content, so the render is a functional component over the document it draws
const CanvasNodes = (props: { open: OpenPageBuilderDocument; origin: string }) => {
  if (props.open.type === ResourceType.Email)
    return h(
      "div",
      { style: { margin: "0 auto", maxWidth: "37.5rem" } },
      renderEmailCanvasVNodes(props.open.kind, props.open.document, emailWidth.value),
    );

  return renderCanvasVNodes(props.open.kind, props.open.document, { origin: props.origin });
};
</script>

<template>
  <PageBuilderCanvasFrame v-if="pageDocument" :css :device tabindex="0" aria-label="Canvas of the page" title="Page">
    <div
      ref="contentRoot"
      :style="{ position: 'relative' }"
      @click="setSelectedNodeId(resourceId, getNodeIdFromElement($event.target) ?? '')"
      @pointerleave="hoveredNodeId = ''"
      @pointerover="hoveredNodeId = getNodeIdFromElement($event.target) ?? ''"
    >
      <CanvasNodes v-if="renderedOpen" :open="renderedOpen" :origin />
      <Teleport v-if="editingElement && editingNodeId" :to="editingElement">
        <PageBuilderCanvasTextEditor :key="editingNodeId" :kind :node-id="editingNodeId" :resource-id />
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
    v-model:is-delete-open="isDeleteOpen"
    :announce
    :kind
    :position="toolbarPosition"
    :resource-id
  />
</template>
