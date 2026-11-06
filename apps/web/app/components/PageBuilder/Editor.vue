<script setup lang="ts">
import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { Context } from "vue-editor-layout-headless";

import PageBuilderBar from "@/components/PageBuilder/Bar.vue";
import PageBuilderContentPanel from "@/components/PageBuilder/ContentPanel.vue";
import PageBuilderLayers from "@/components/PageBuilder/Layers.vue";
import PageBuilderPalette from "@/components/PageBuilder/Palette.vue";
import PageBuilderStylePanel from "@/components/PageBuilder/StylePanel/Index.vue";
import PageBuilderThemePanel from "@/components/PageBuilder/ThemePanel/Index.vue";
import { EditorType } from "@/models/editor/EditorType";
import {
  PAGE_BUILDER_CONTENT_KEY_MAP,
  PAGE_BUILDER_PANEL_ID_MAP,
  PAGE_BUILDER_REGION_ID_MAP,
  PAGE_BUILDER_REGION_NAME_MAP,
  PAGE_BUILDER_SELECTION_KIND_MAP,
} from "@/services/pageBuilder/pageBuilderLayout";
import { webpageLayout } from "@/services/pageBuilder/webpageLayout";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

interface Props {
  // The kind the resource's document is edited through, which the page builder's kind holds with the document
  kind: AnyPageBuilderKind;
  resourceId: string;
}

const { kind, resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId } = pageBuilderCanvasStore;
const shell = useTemplateRef("shell");
const editorShell = useTemplateRef("editorShell");
// The layers tree is a tab of the blocks region, so that tab is shown before a text edit's end focuses the node's row in it
const {
  announce,
  announcement,
  dragPoint,
  draggedType,
  dropTarget,
  getFrameGeometry,
  getPageDocument,
  handleCanvasKeydown,
  handleEnterKeydown,
  isDeleteOpen,
  isDragging,
  refusal,
  startMergeFieldDrag,
  startPaletteDrag,
} = usePageBuilderEditor(
  kind,
  resourceId,
  () => shell.value,
  () => editorShell.value?.setActivePanel(PAGE_BUILDER_REGION_ID_MAP.Blocks, PAGE_BUILDER_PANEL_ID_MAP.Layers),
);
const pageDocument = computed(getPageDocument);
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
  [PAGE_BUILDER_CONTENT_KEY_MAP.Style]: () => h(PageBuilderStylePanel, { resourceId }),
  [PAGE_BUILDER_CONTENT_KEY_MAP.Theme]: () => h(PageBuilderThemePanel, { resourceId }),
};
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
      :layout="webpageLayout.layout"
      :panel-name-map="webpageLayout.panelNameMap"
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
