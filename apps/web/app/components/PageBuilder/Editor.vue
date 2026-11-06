<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { Context } from "vue-editor-layout-headless";

import PageBuilderBar from "@/components/PageBuilder/Bar.vue";
import PageBuilderContentPanel from "@/components/PageBuilder/ContentPanel.vue";
import PageBuilderEmailStylePanel from "@/components/PageBuilder/Email/StylePanel.vue";
import PageBuilderLayers from "@/components/PageBuilder/Layers.vue";
import PageBuilderPalette from "@/components/PageBuilder/Palette.vue";
import PageBuilderStylePanel from "@/components/PageBuilder/StylePanel/Index.vue";
import PageBuilderThemePanel from "@/components/PageBuilder/ThemePanel/Index.vue";
import { EditorType } from "@/models/editor/EditorType";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { emailLayout } from "@/services/pageBuilder/emailLayout";
import {
  PAGE_BUILDER_CONTENT_KEY_MAP,
  PAGE_BUILDER_PANEL_ID_MAP,
  PAGE_BUILDER_REGION_ID_MAP,
  PAGE_BUILDER_REGION_NAME_MAP,
  PAGE_BUILDER_SELECTION_KIND_MAP,
} from "@/services/pageBuilder/pageBuilderLayout";
import { webpageLayout } from "@/services/pageBuilder/webpageLayout";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  // The kind the resource's document is edited through, which the page builder's kind holds with the document
  kind: AnyPageBuilderKind;
  resourceId: string;
}

const { kind, resourceId } = defineProps<Props>();
// The layout the kind is arranged by, its settings tabs and the names of its tabs
const pageBuilderLayout = kind.editor === PageBuilderEditor.Email ? emailLayout : webpageLayout;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
// The document the resource holds under either kind, read through the kind the shell is given
const getPageDocument = () => getHeldDocument(resourceId)?.document;
const pageDocument = computed(getPageDocument);
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getEditingNodeId, getSelectedNodeId } = pageBuilderCanvasStore;
// A node is the one selection kind a page builder layout names, and nothing selected is the empty kind
const context = computed<Context>(() => {
  const isNodeSelected = getSelectedNodeId(resourceId) !== "";
  return {
    mode: "",
    selectionCount: isNodeSelected ? 1 : 0,
    selectionKind: isNodeSelected ? PAGE_BUILDER_SELECTION_KIND_MAP.Node : PAGE_BUILDER_SELECTION_KIND_MAP.Nothing,
    tool: "",
  };
});
const shell = useTemplateRef("shell");
const editorShell = useTemplateRef("editorShell");
// The one live region every announcement goes through. Clearing first lets a repeat of the same text be announced again
const announcement = ref("");
const announce = (message: string) => {
  announcement.value = "";
  nextTick(() => {
    announcement.value = message;
  });
};
// The node delete a toolbar asks for is held here, since the editor's keys are not bound while it asks
const isDeleteOpen = ref(false);
const { handleCanvasKeydown, handleEnterKeydown } = usePageBuilderKeyCommands(
  kind,
  getPageDocument,
  () => resourceId,
  announce,
  isDeleteOpen,
);
usePageBuilderHistoryCommands(() => resourceId);
usePageBuilderStyleCommands(() => resourceId);
const { dragPoint, draggedType, dropTarget, isDragging, refusal, startMergeFieldDrag, startPaletteDrag } =
  usePageBuilderDrag(kind, getPageDocument, () => resourceId, announce);
// A refusal is announced as it begins, not on every move, since the ghost showing it follows the pointer
watch(refusal, (message) => {
  if (message) announce(message);
});
const canvas = useTemplateRef("canvas");
// The canvas is mounted only once the page has content, so a palette drag on an empty page finds no frame and stays a click
const getFrameGeometry = () => canvas.value?.getFrameGeometry();
// The findings the critique holds for the page, which the bar's problems surface lists, and the title of each finding's node
const { findings, getFindingNodeTitle } = usePageBuilderCritique(() => resourceId);
// What fills each panel, by the content key the layout names it with
const registry: EditorRegistry = {
  [PAGE_BUILDER_CONTENT_KEY_MAP.Bar]: () =>
    h(PageBuilderBar, { findings: findings.value, getNodeTitle: getFindingNodeTitle, resourceId }),
  [PAGE_BUILDER_CONTENT_KEY_MAP.Blocks]: () =>
    h(PageBuilderPalette, {
      announce,
      getDocument: getPageDocument,
      getFrameGeometry,
      kind,
      resourceId,
      startMergeFieldDrag,
      startPaletteDrag,
    }),
  [PAGE_BUILDER_CONTENT_KEY_MAP.Content]: () => h(PageBuilderContentPanel, { kind, resourceId }),
  [PAGE_BUILDER_CONTENT_KEY_MAP.Layers]: () => h(PageBuilderLayers, { getDocument: getPageDocument, kind, resourceId }),
  [PAGE_BUILDER_CONTENT_KEY_MAP.Style]: () =>
    kind.editor === PageBuilderEditor.Email
      ? h(PageBuilderEmailStylePanel, { resourceId })
      : h(PageBuilderStylePanel, { resourceId }),
  [PAGE_BUILDER_CONTENT_KEY_MAP.Theme]: () => h(PageBuilderThemePanel, { resourceId }),
};
// Leaving a text edit returns focus to the node's row in the layers tree, since the edit held it inside the frame. The tree is
// The layers tab of the blocks region, so that tab is shown before the row is focused
watch(
  () => getEditingNodeId(resourceId),
  (nodeId, previousNodeId) => {
    if (nodeId || !previousNodeId) return;

    editorShell.value?.setActivePanel(PAGE_BUILDER_REGION_ID_MAP.Blocks, PAGE_BUILDER_PANEL_ID_MAP.Layers);
    nextTick(() => {
      shell.value
        ?.querySelector<HTMLElement>(`[role="treeitem"][data-item-id="${CSS.escape(previousNodeId)}"]`)
        ?.focus();
    });
  },
);
</script>

<template>
  <div
    v-if="pageDocument"
    ref="shell"
    :class="{ 'pointer-events-none': isDragging }"
    h-full
    min-h-0
    @keydown="handleEnterKeydown($event)"
  >
    <EditorShell
      ref="editorShell"
      :context
      :editor-type="EditorType.PageBuilder"
      :layout="pageBuilderLayout.layout"
      :panel-name-map="pageBuilderLayout.panelNameMap"
      :region-name-map="PAGE_BUILDER_REGION_NAME_MAP"
      :registry
    >
      <PageBuilderEmptyPage v-if="pageDocument.content.length === 0" />
      <PageBuilderCanvas
        v-else
        ref="canvas"
        v-model:is-delete-open="isDeleteOpen"
        :announce
        :dragged-type="draggedType"
        :drop-target
        :kind
        :resource-id
        @canvas-keydown="handleCanvasKeydown($event)"
      />
    </EditorShell>
    <!-- The ghost names the block, or says why the block is refused over the frame where no slot takes it -->
    <UiDragGhost
      v-if="dragPoint && draggedType"
      :icon="kind.icons[draggedType]"
      :point="dragPoint"
      :title="refusal || kind.titles[draggedType] || ''"
    />
    <div role="status" aria-live="polite" sr-only>{{ announcement }}</div>
  </div>
</template>
