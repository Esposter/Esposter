<script setup lang="ts">
import type { EditorFinding } from "@/models/editor/EditorFinding";
import type { Component } from "vue";
import type { Context } from "vue-editor-layout-headless";

import PageBuilderContentPanel from "@/components/PageBuilder/ContentPanel.vue";
import PageBuilderEmailBar from "@/components/PageBuilder/Email/Bar.vue";
import PageBuilderEmailStylePanel from "@/components/PageBuilder/Email/StylePanel.vue";
import PageBuilderLayers from "@/components/PageBuilder/Layers.vue";
import PageBuilderPalette from "@/components/PageBuilder/Palette.vue";
import { EditorType } from "@/models/editor/EditorType";
import { EmailContentKey } from "@/models/emailEditor/EmailContentKey";
import { EmailSelectionKind } from "@/models/emailEditor/EmailSelectionKind";
import { EmailView } from "@/models/pageBuilder/EmailView";
import {
  EMAIL_BLOCKS_REGION_ID,
  EMAIL_STRUCTURE_PANEL_ID,
  emailLayout,
  emailPanelNameMap,
  emailRegionNameMap,
} from "@/services/emailEditor/emailLayout";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { getNodeTitleById } from "@/services/pageBuilder/getNodeTitleById";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";

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
const view = ref(EmailView.Design);
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
  emailKind,
  resourceId,
  () => root.value,
  () => editorShell.value?.setActivePanel(EMAIL_BLOCKS_REGION_ID, EMAIL_STRUCTURE_PANEL_ID),
);
const preview = useTemplateRef("preview");
// The problems the compile found, which the bar lists in both modes
const findings = computed<EditorFinding[]>(() => preview.value?.findings ?? []);
const device = computed(() => getDevice(resourceId));
// What the shell resolves the layout for: the mode, and whether a node is selected, which the inspector's tabs follow
const context = computed<Context>(() => {
  const nodeId = getSelectedNodeId(resourceId);
  return {
    mode: view.value,
    selectionCount: nodeId ? 1 : 0,
    selectionKind: nodeId ? EmailSelectionKind.Node : EmailSelectionKind.None,
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
  [EmailContentKey.Settings]: () => h(PageBuilderContentPanel, { kind: emailKind, resourceId }),
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
          ref="canvas"
          v-model:is-delete-open="isDeleteOpen"
          :announce
          :dragged-type="draggedType"
          :drop-target
          :kind="emailKind"
          :resource-id
          @canvas-keydown="handleCanvasKeydown($event)"
        />
      </div>
      <PageBuilderEmailPreview
        v-if="emailDocument"
        v-show="view === EmailView.Preview"
        ref="preview"
        :device
        :email-document="emailDocument"
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
