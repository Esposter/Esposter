<script setup lang="ts">
import type { EditorFinding } from "#src/models/editor/EditorFinding";
import type { Context } from "vue-editor-layout-headless";

import PageBuilderContentPanel from "#src/components/PageBuilder/ContentPanel.vue";
import PageBuilderEmailBar from "#src/components/PageBuilder/Email/Bar.vue";
import PageBuilderEmailStylePanel from "#src/components/PageBuilder/Email/StylePanel.vue";
import PageBuilderLayers from "#src/components/PageBuilder/Layers.vue";
import PageBuilderPalette from "#src/components/PageBuilder/Palette.vue";
import UiEmptyState from "#src/components/Ui/EmptyState.vue";
import { EditorType } from "#src/models/editor/EditorType";
import { EmailContentKey } from "#src/models/emailEditor/EmailContentKey";
import { EmailView } from "#src/models/pageBuilder/EmailView";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import {
  EMAIL_BLOCKS_REGION_ID,
  EMAIL_STRUCTURE_PANEL_ID,
  emailLayout,
  emailPanelNameMap,
  emailRegionNameMap,
} from "#src/services/emailEditor/emailLayout";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { getNodeTitleById } from "#src/services/pageBuilder/getNodeTitleById";
import { PAGE_BUILDER_SELECTION_KIND_MAP } from "#src/services/pageBuilder/pageBuilderLayout";
import { useEmailExportDialogStore } from "#src/store/emailEditor/exportDialog";
import { useEmailEditorStore } from "#src/store/emailEditor/index";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { useResourceStore } from "#src/store/resource/index";

const emailEditorStore = useEmailEditorStore();
const { loadContent, saveEmail } = emailEditorStore;
const { datasetReference } = storeToRefs(emailEditorStore);
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getEmailDocument, setMergeFieldColumns } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice, getSelectedNodeId } = pageBuilderCanvasStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
// Read before the load's await, so it names the email this blade mounted for even if the next one loads meanwhile
const resourceId = currentResourceId.value;
const emailDocument = computed(() => getEmailDocument(resourceId));
await loadContent();
// The page builder's edits are saved through the content store's own autosave cadence, which the document's deep watch drives
watchAutosave(emailDocument, () => saveEmail(resourceId));
const { dataset, error } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
// The page builder offers the bound dataset's columns as merge fields, so this blade holds them in the store under its email
watchImmediate(columnNames, (newColumnNames) => setMergeFieldColumns(resourceId, newColumnNames));
// Design and Preview are modes of one editor: Preview removes the editing regions and draws the compiled message. The design stays
// Mounted beneath it, so its edits and selection survive, and the preview compiles in Design too, so its findings reach the bar
const view = ref<EmailView>(EmailView.Design);
const emailExportDialogStore = useEmailExportDialogStore();
const { setPendingDataset } = emailExportDialogStore;
// The stores outlive the blade, so the export and the merge fields staged for this email are torn down with it, since a
// Keyed swap has already loaded the next email by the time this one unmounts
onUnmounted(() => {
  setPendingDataset(resourceId, undefined);
  setMergeFieldColumns(resourceId, []);
});
const root = useTemplateRef("root");
const editorShell = useTemplateRef("editorShell");
const {
  announce,
  announcement,
  draggedNodeId,
  draggedType,
  dragPoint,
  dropTarget,
  getFrameGeometry,
  getPageDocument,
  handleCanvasKeydown,
  handleEnterKeydown,
  isDeleteOpen,
  isDragging,
  refusal,
  startMergeFieldDrag,
  startNodeDrag,
  startPaletteDrag,
} = usePageBuilderEditor(
  emailKind,
  resourceId,
  () => root.value,
  () => editorShell.value?.setActivePanel(EMAIL_BLOCKS_REGION_ID, EMAIL_STRUCTURE_PANEL_ID),
);
const preview = useTemplateRef("preview");
// The critique of the open email beside the problems the compile found, both listed by the bar in each mode
const critiqueFindings = useEmailCritique(resourceId);
const findings = computed<EditorFinding[]>(() => [...(preview.value?.findings ?? []), ...critiqueFindings.value]);
// What the shell resolves the layout for: the mode, and whether a node is selected, which the inspector's tabs follow
const context = computed<Context>(() => {
  const nodeId = getSelectedNodeId(resourceId);
  return {
    mode: view.value,
    selectionCount: nodeId ? 1 : 0,
    selectionKind: nodeId ? PAGE_BUILDER_SELECTION_KIND_MAP.Node : PAGE_BUILDER_SELECTION_KIND_MAP.Nothing,
    tool: "",
  };
});
// A finding's node is titled by its block type, read from the email the blade holds
const getNodeTitle = (nodeId: string) => {
  const document = emailDocument.value;
  return document ? getNodeTitleById(emailKind, document, nodeId) : nodeId;
};
// The shell draws each content key with no props, so the blade binds what each component takes, from the state it holds
const registry: Record<EmailContentKey, Component> = {
  [EmailContentKey.Bar]: () =>
    h(PageBuilderEmailBar, {
      error: error.value,
      findings: findings.value,
      getNodeTitle,
      modelValue: view.value,
      "onUpdate:modelValue": (newView: EmailView) => {
        view.value = newView;
      },
      resourceId,
    }),
  [EmailContentKey.Content]: () => h(PageBuilderContentPanel, { kind: emailKind, resourceId }),
  [EmailContentKey.Layers]: () => h(PageBuilderLayers, { getDocument: getPageDocument, kind: emailKind, resourceId }),
  [EmailContentKey.Palette]: () =>
    h(PageBuilderPalette, {
      announce,
      getDocument: getPageDocument,
      getFrameGeometry,
      kind: emailKind,
      resourceId,
      startMergeFieldDrag,
      startPaletteDrag,
    }),
  // The email has no document settings of its own, so with nothing selected the inspector asks for a selection and the canvas
  // Keeps its width when one is made
  [EmailContentKey.Prompt]: () =>
    h(UiEmptyState, {
      description: "Select a block on the canvas to edit its content and style.",
      meaning: UiIconMeaning.Pointer,
      title: "Nothing selected",
    }),
  [EmailContentKey.Style]: () => h(PageBuilderEmailStylePanel, { resourceId }),
};
</script>

<template>
  <div ref="root" flex flex-col h-full min-h-0 @keydown="handleEnterKeydown($event)">
    <EditorShell
      v-if="emailDocument"
      ref="editorShell"
      :class="{ 'pointer-events-none': isDragging }"
      :context
      :editor-type="EditorType.Email"
      :layout="emailLayout"
      :panel-name-map="emailPanelNameMap"
      :region-name-map="emailRegionNameMap"
      :registry
    >
      <div v-show="view === EmailView.Design" flex flex-1 flex-col gap-2 min-h-0 min-w-0>
        <PageBuilderEmptyPage v-if="emailDocument?.content.length === 0" />
        <PageBuilderCanvas
          v-else
          v-model:is-delete-open="isDeleteOpen"
          :announce
          :dragged-node-id
          :dragged-type
          :drop-target
          :kind="emailKind"
          :resource-id
          :start-node-drag
          @canvas-keydown="handleCanvasKeydown($event)"
        />
      </div>
      <PageBuilderEmailPreview
        v-if="emailDocument"
        v-show="view === EmailView.Preview"
        ref="preview"
        :device="getDevice(resourceId)"
        :email-document
      />
    </EditorShell>
    <div role="status" aria-live="polite" sr-only>{{ announcement }}</div>
    <!-- The ghost names the block, or says why the block is refused over the frame where no slot takes it -->
    <UiDragGhost
      v-if="dragPoint && draggedType"
      :icon="emailKind.icons[draggedType]"
      :point="dragPoint"
      :title="refusal || emailKind.titles[draggedType] || ''"
    />
    <!-- The export confirm is drawn here, since this blade holds the dataset it decides on -->
    <ResourceEmailExportTruncationDialog />
    <ResourceEmailImportDialog />
  </div>
</template>
