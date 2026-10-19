<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { usePageBuilderClipboard } from "@/composables/pageBuilder/usePageBuilderClipboard";
import { usePageBuilderDrag } from "@/composables/pageBuilder/usePageBuilderDrag";
import { usePageBuilderHistoryCommands } from "@/composables/pageBuilder/usePageBuilderHistoryCommands";
import { usePageBuilderMoves } from "@/composables/pageBuilder/usePageBuilderMoves";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { getBlockNode } from "headless-block-editor";

interface Props {
  resourceId: string;
}

const MIN_SIDE_PANE_WIDTH = 200;
const MAX_SIDE_PANE_WIDTH = 480;
const DEFAULT_SIDE_PANE_WIDTH = 260;
const CONTENT_PANEL = "Content";
const panelItems: UiTabItem<string>[] = [{ title: CONTENT_PANEL, value: CONTENT_PANEL }];

const { resourceId } = defineProps<Props>();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const shell = useTemplateRef("shell");
const leftWidth = ref(DEFAULT_SIDE_PANE_WIDTH);
const rightWidth = ref(DEFAULT_SIDE_PANE_WIDTH);
const panel = ref(CONTENT_PANEL);
// The one live region every announcement goes through. Clearing first lets a repeat of the same text be announced again
const announcement = ref("");
const announce = (message: string) => {
  announcement.value = "";
  nextTick(() => {
    announcement.value = message;
  });
};
const { deleteSelected, moveDown, moveLeft, moveRight, moveUp } = usePageBuilderMoves(() => resourceId, announce);
const { copySelected, cutSelected, pasteSelected } = usePageBuilderClipboard(() => resourceId, announce);
usePageBuilderHistoryCommands(() => resourceId);
const { dropTarget, isDragging, startPaletteDrag } = usePageBuilderDrag(() => resourceId, announce);
const canvas = useTemplateRef("canvas");
// The canvas is mounted only once the page has content, so a palette drag on an empty page finds no frame and stays a click
const getFrameGeometry = () => canvas.value?.getFrameGeometry();

// The move an Alt chord makes with an arrow key, or none for any other key
const getAltMove = (key: string) => {
  switch (key) {
    case "ArrowDown":
      return moveDown;
    case "ArrowLeft":
      return moveLeft;
    case "ArrowRight":
      return moveRight;
    case "ArrowUp":
      return moveUp;
    default:
      return undefined;
  }
};
// The clipboard command a Ctrl or Cmd chord makes with C, X or V, or none for any other key
const getClipboardCommand = (key: string) => {
  switch (key.toLowerCase()) {
    case "c":
      return copySelected;
    case "v":
      return pasteSelected;
    case "x":
      return cutSelected;
    default:
      return undefined;
  }
};
// Enter edits the selected node in place when it is a text node, and does nothing for any other node
const startTextEdit = () => {
  const document = pageBuilderDocumentStore.getDocument(resourceId);
  const nodeId = pageBuilderCanvasStore.getSelectedNodeId(resourceId);
  const nodePointer = document && getNodePointer(document, nodeId);
  if (!document || nodePointer === undefined) return;
  if (getBlockNode(document, nodePointer)?.type !== WebpageNodeType.Text) return;

  pageBuilderCanvasStore.setEditingNodeId(resourceId, nodeId);
};
// Leaving a text edit returns focus to the node's row in the layers tree, since the edit held it inside the frame
watch(
  () => pageBuilderCanvasStore.getEditingNodeId(resourceId),
  (nodeId, previousNodeId) => {
    if (nodeId || !previousNodeId) return;

    shell.value?.querySelector<HTMLElement>(`[role="treeitem"][data-item-id="${CSS.escape(previousNodeId)}"]`)?.focus();
  },
);
// A focused button or link takes Enter as its own activation, so the key starts no edit from there
// Duck-typed rather than instanceof Element, since a key pressed in the canvas frame comes from the frame's own realm
const checkIsControlTarget = (target: EventTarget | null) =>
  target !== null && "tagName" in target && (target as Element).closest("button, a[href]") !== null;
// Keys are not taken while the user types in a field, so Delete and the arrows keep their own meaning there
// The canvas forwards the keys its frame takes no command for, so the frame's keys reach the same handler as the shell's own
const handleEditorKeydown = (event: KeyboardEvent) => {
  if (checkIsEditableTarget(event.target)) return;

  const clipboardCommand = event.ctrlKey || event.metaKey ? getClipboardCommand(event.key) : undefined;
  if (clipboardCommand) {
    event.preventDefault();
    clipboardCommand();
    return;
  }
  if (event.key === "Enter") {
    if (!checkIsControlTarget(event.target)) startTextEdit();
    return;
  }
  if (event.altKey) {
    const move = getAltMove(event.key);
    if (!move) return;

    event.preventDefault();
    move();
    return;
  }
  if (event.key !== "Delete" && event.key !== "Backspace") return;

  event.preventDefault();
  deleteSelected();
};
</script>

<template>
  <div
    v-if="pageDocument"
    ref="shell"
    :class="{ 'pointer-events-none': isDragging }"
    flex
    gap-2
    h-full
    min-h-0
    @keydown="handleEditorKeydown"
  >
    <div :style="{ width: `${leftWidth}px` }" relative flex flex-col gap-4 shrink-0 min-h-0>
      <div flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto>
        <PageBuilderPalette :announce :get-frame-geometry :resource-id :start-palette-drag />
        <PageBuilderLayers :resource-id />
      </div>
      <UiResizeHandle
        v-model="leftWidth"
        label="Resize the palette and layers"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
    </div>
    <div flex flex-col gap-2 flex-1 min-w-0 min-h-0>
      <PageBuilderCanvasDeviceToggle :resource-id />
      <PageBuilderEmptyPage v-if="pageDocument.content.length === 0" :announce :resource-id />
      <PageBuilderCanvas
        v-else
        ref="canvas"
        :announce
        :drop-target="dropTarget"
        :resource-id
        @canvas-keydown="handleEditorKeydown"
      />
    </div>
    <div :style="{ width: `${rightWidth}px` }" relative shrink-0 min-h-0>
      <UiResizeHandle
        v-model="rightWidth"
        is-reversed
        label="Resize the content panel"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
      <UiTabs v-model="panel" is-filling :items="panelItems" label="Node settings" h-full>
        <PageBuilderContentPanel :resource-id />
      </UiTabs>
    </div>
    <div role="status" aria-live="polite" sr-only>{{ announcement }}</div>
  </div>
</template>
