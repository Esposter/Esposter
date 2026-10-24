<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { KeyAction } from "@/models/pageBuilder/KeyAction";
import { KeyScope } from "@/models/pageBuilder/KeyScope";
import {
  CONTENT_PANEL,
  DEFAULT_SIDE_PANE_WIDTH,
  MAX_SIDE_PANE_WIDTH,
  MIN_SIDE_PANE_WIDTH,
  STYLE_PANEL,
  THEME_PANEL,
} from "@/services/pageBuilder/constants";
import { getKeyAction } from "@/services/pageBuilder/getKeyAction";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { getBlockNode } from "headless-block-editor";

interface Props {
  resourceId: string;
}

const panelItems: UiTabItem<string>[] = [
  { title: CONTENT_PANEL, value: CONTENT_PANEL },
  { title: STYLE_PANEL, value: STYLE_PANEL },
  { title: THEME_PANEL, value: THEME_PANEL },
];

const { resourceId } = defineProps<Props>();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument, getOpenDocument } = pageBuilderDocumentStore;
const pageDocument = computed(() => getDocument(resourceId));
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getEditingNodeId, getSelectedNodeId, setEditingNodeId } = pageBuilderCanvasStore;
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
const { deleteNode, deleteSelected, moveDown, moveLeft, moveRight, moveUp } = usePageBuilderMoves(
  webpageKind,
  () => getDocument(resourceId),
  () => resourceId,
  announce,
);
const { copySelected, cutSelected, pasteSelected } = usePageBuilderClipboard(
  webpageKind,
  () => getDocument(resourceId),
  () => resourceId,
  announce,
  deleteNode,
);
usePageBuilderHistoryCommands(() => resourceId);
usePageBuilderStyleCommands(() => resourceId);
const { dropTarget, isDragging, startPaletteDrag } = usePageBuilderDrag(
  webpageKind,
  () => getDocument(resourceId),
  () => resourceId,
  announce,
);
const canvas = useTemplateRef("canvas");
// The canvas is mounted only once the page has content, so a palette drag on an empty page finds no frame and stays a click
const getFrameGeometry = () => canvas.value?.getFrameGeometry();

// Enter edits the selected node in place when it is a text node, and does nothing for any other node
const startTextEdit = () => {
  const open = getOpenDocument(resourceId);
  const nodeId = getSelectedNodeId(resourceId);
  const nodePointer = open && getNodePointer(open.kind, open.document, nodeId);
  if (!open || nodePointer === undefined) return;
  if (getBlockNode(open.document, nodePointer, open.kind.children)?.type !== WebpageNodeType.Text) return;

  setEditingNodeId(resourceId, nodeId);
};
// Leaving a text edit returns focus to the node's row in the layers tree, since the edit held it inside the frame
watch(
  () => getEditingNodeId(resourceId),
  (nodeId, previousNodeId) => {
    if (nodeId || !previousNodeId) return;

    shell.value?.querySelector<HTMLElement>(`[role="treeitem"][data-item-id="${CSS.escape(previousNodeId)}"]`)?.focus();
  },
);
// The command each key the editor takes runs, by the action the key table gives it. The canvas's own keys are not among them
const editorKeyCommands: Partial<Record<KeyAction, () => void>> = {
  [KeyAction.Copy]: copySelected,
  [KeyAction.Cut]: cutSelected,
  [KeyAction.Delete]: deleteSelected,
  [KeyAction.MoveDown]: moveDown,
  [KeyAction.MoveLeft]: moveLeft,
  [KeyAction.MoveRight]: moveRight,
  [KeyAction.MoveUp]: moveUp,
  [KeyAction.Paste]: pasteSelected,
  [KeyAction.StartTextEdit]: startTextEdit,
};
// The canvas forwards the keys its frame takes no command for, so the frame's keys reach the same handler as the shell's own
const handleEditorKeydown = (event: KeyboardEvent) => {
  const action = getKeyAction(event, KeyScope.Editor);
  if (!action) return;

  // Starting a text edit leaves Enter's default alone, while every other command the key takes prevents it
  if (action !== KeyAction.StartTextEdit) event.preventDefault();
  editorKeyCommands[action]?.();
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
    @keydown="handleEditorKeydown($event)"
  >
    <div :style="{ width: `${leftWidth}px` }" flex shrink-0 flex-col gap-4 min-h-0 relative>
      <div flex flex-1 flex-col gap-4 min-h-0 of-y-auto>
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
    <div flex flex-1 flex-col gap-2 min-h-0 min-w-0>
      <PageBuilderCanvasDeviceToggle :resource-id />
      <PageBuilderEmptyPage v-if="pageDocument.content.length === 0" :announce :resource-id />
      <PageBuilderCanvas
        v-else
        ref="canvas"
        :announce
        :drop-target
        :resource-id
        @canvas-keydown="handleEditorKeydown($event)"
      />
    </div>
    <div :style="{ width: `${rightWidth}px` }" shrink-0 min-h-0 relative>
      <UiResizeHandle
        v-model="rightWidth"
        is-reversed
        label="Resize the content panel"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
      <UiTabs v-model="panel" is-filling :items="panelItems" label="Node settings" h-full>
        <PageBuilderContentPanel v-if="panel === CONTENT_PANEL" :resource-id />
        <PageBuilderStylePanel v-if="panel === STYLE_PANEL" :resource-id />
        <PageBuilderThemePanel v-if="panel === THEME_PANEL" :resource-id />
      </UiTabs>
    </div>
    <div role="status" aria-live="polite" sr-only>{{ announcement }}</div>
  </div>
</template>
