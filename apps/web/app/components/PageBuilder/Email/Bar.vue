<script setup lang="ts">
import type { EditorFinding } from "@/models/editor/EditorFinding";
import type { Item } from "@/models/shared/Item";

import { MAX_EMAIL_PREVIEW_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { EmailView } from "@/models/pageBuilder/EmailView";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToggleGroupVariant } from "@/models/ui/UiToggleGroupVariant";
import { authClient } from "@/services/auth/authClient";
import { ROOT_INTERACTION_ID, ROOT_POINTER } from "@/services/pageBuilder/constants";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailImportDialogStore } from "@/store/emailEditor/importDialog";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { JsonPatchOperationType, noop } from "@esposter/shared";

interface Props {
  // Why the picked dataset could not be read, which the picker shows beside its choice
  error: string;
  // The problems the editor's checks found in the document, each naming the node it concerns by id
  findings: EditorFinding[];
  // The title a node is listed under in the problems surface
  getNodeTitle: (nodeId: string) => string;
  // The email the bar edits
  resourceId: string;
}

// The mode the editor shows, Design or Preview, which the bar's switch chooses between
const modelValue = defineModel<EmailView>({ required: true });
const { error, findings, getNodeTitle, resourceId } = defineProps<Props>();
const session = authClient.useSession();
const emailEditorStore = useEmailEditorStore();
const { datasetReference } = storeToRefs(emailEditorStore);
const { saveDatasetReference } = emailEditorStore;
const emailImportDialogStore = useEmailImportDialogStore();
const { openImport } = emailImportDialogStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { setSelectedNodeId } = pageBuilderCanvasStore;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getEmailDocument } = pageBuilderDocumentStore;
const pageBuilderHistoryStore = usePageBuilderHistoryStore();
const { applyEdit } = pageBuilderHistoryStore;
const viewItems = [
  { title: "Design", value: EmailView.Design },
  { title: "Preview", value: EmailView.Preview },
];
// The preview text is the root's preview, written as one root edit so an undo takes the line back, and typing coalesces
const previewText = computed({
  get: () => getEmailDocument(resourceId)?.root.props.preview || "",
  set: (value) => {
    const emailDocument = getEmailDocument(resourceId);
    if (!emailDocument) return;

    applyEdit(
      resourceId,
      [
        {
          op: JsonPatchOperationType.Replace,
          path: `${ROOT_POINTER}/props`,
          value: { ...emailDocument.root.props, preview: value },
        },
      ],
      "Edit preview text",
      ROOT_INTERACTION_ID,
    ).match(noop, console.error);
  },
});
// Import is occasional, so it sits in the overflow menu, from which it opens the import for the email the bar edits
const overflowItems: Item[] = [
  { meaning: UiIconMeaning.Upload, onClick: () => openImport(resourceId), title: "Import MJML" },
];
</script>

<template>
  <!-- One row at every width: a narrow window scrolls it sideways, so no control wraps below the bar or hides behind the canvas -->
  <div ui-bar of-x-auto>
    <div px-4 py-2 flex gap-4 min-w-full w-max items-center>
      <DatasetReferencePicker
        v-if="session.data"
        :error
        :model-value="datasetReference"
        @update:model-value="saveDatasetReference($event)"
      />
      <UiToggleGroup v-model="modelValue" :items="viewItems" label="View" :variant="UiToggleGroupVariant.Header" />
      <UiTextField
        v-model="previewText"
        :counter="MAX_EMAIL_PREVIEW_LENGTH"
        hint="The line an inbox shows beside the subject"
        label="Preview text"
      />
      <PageBuilderCanvasDeviceToggle :resource-id />
      <EditorProblems
        :findings
        :get-node-title
        @select="
          (nodeId) => {
            if (nodeId) setSelectedNodeId(resourceId, nodeId);
          }
        "
      />
      <UiOverflowMenu :items="overflowItems" label="More email actions" />
    </div>
  </div>
</template>
