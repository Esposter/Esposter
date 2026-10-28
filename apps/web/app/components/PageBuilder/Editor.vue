<script setup lang="ts">
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { KeyAction } from "@/models/pageBuilder/KeyAction";
import { KeyScope } from "@/models/pageBuilder/KeyScope";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
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
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { getBlockNode } from "headless-block-editor";

interface Props {
  // The kind the resource's document is edited through, which the page builder's kind holds with the document
  kind: AnyPageBuilderKind;
  resourceId: string;
}

const { kind, resourceId } = defineProps<Props>();
// The settings tabs the kind has content for: an email has no theme, so its tabs stop at content and style
const panelItems = computed<UiTabItem<string>[]>(() => [
  { title: CONTENT_PANEL, value: CONTENT_PANEL },
  { title: STYLE_PANEL, value: STYLE_PANEL },
  ...(kind.editor === PageBuilderEditor.Email ? [] : [{ title: THEME_PANEL, value: THEME_PANEL }]),
]);

const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
// The document the resource holds under either kind, read through the kind the shell is given
const getPageDocument = () => getHeldDocument(resourceId)?.document;
const pageDocument = computed(getPageDocument);
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
  kind,
  getPageDocument,
  () => resourceId,
  announce,
);
const { copySelected, cutSelected, pasteSelected } = usePageBuilderClipboard(
  kind,
  getPageDocument,
  () => resourceId,
  announce,
  deleteNode,
);
usePageBuilderHistoryCommands(() => resourceId);
usePageBuilderStyleCommands(() => resourceId);
const { dropTarget, isDragging, startMergeFieldDrag, startPaletteDrag } = usePageBuilderDrag(
  kind,
  getPageDocument,
  () => resourceId,
  announce,
);
const canvas = useTemplateRef("canvas");
// The canvas is mounted only once the page has content, so a palette drag on an empty page finds no frame and stays a click
const getFrameGeometry = () => canvas.value?.getFrameGeometry();
// Enter edits the selected node in place when it is a text node, and does nothing for any other node
const startTextEdit = () => {
  const currentDocument = getPageDocument();
  const nodeId = getSelectedNodeId(resourceId);
  const nodePointer = currentDocument && getNodePointer(kind, currentDocument, nodeId);
  if (!currentDocument || nodePointer === undefined) return;
  if (getBlockNode(currentDocument, nodePointer, kind.children)?.type !== WebpageNodeType.Text) return;

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
      <div p-3 flex flex-1 flex-col gap-4 min-h-0 of-y-auto>
        <PageBuilderPalette
          :announce
          :get-document="getPageDocument"
          :get-frame-geometry
          :kind
          :resource-id
          :start-merge-field-drag
          :start-palette-drag
        />
        <PageBuilderLayers :get-document="getPageDocument" :kind :resource-id />
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
      <PageBuilderEmptyPage v-if="pageDocument.content.length === 0" />
      <PageBuilderCanvas
        v-else
        ref="canvas"
        :announce
        :drop-target
        :kind
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
      <UiTabs v-model="panel" :items="panelItems" label="Node settings" is-filling px-3 h-full>
        <PageBuilderContentPanel v-if="panel === CONTENT_PANEL" :kind :resource-id />
        <PageBuilderEmailStylePanel
          v-if="panel === STYLE_PANEL && kind.editor === PageBuilderEditor.Email"
          :resource-id
        />
        <PageBuilderStylePanel v-else-if="panel === STYLE_PANEL" :resource-id />
        <PageBuilderThemePanel v-if="panel === THEME_PANEL" :resource-id />
      </UiTabs>
    </div>
    <div role="status" aria-live="polite" sr-only>{{ announcement }}</div>
  </div>
</template>
