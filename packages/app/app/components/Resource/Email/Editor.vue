<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { MERGE_FIELD_BLOCK_CATEGORY } from "@/services/emailEditor/constants";
import { createEmailSurveyInviteBlocks } from "@/services/emailEditor/createEmailSurveyInviteBlocks";
import { toMergeField } from "@/services/emailEditor/toMergeField";
import { GRAPES_JS_EDITOR_CONTAINER_ID, SURVEY_INVITE_BLOCK_CATEGORY } from "@/services/grapesjs/constants";
import { setBlocks } from "@/services/grapesjs/setBlocks";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { escapeHtml } from "@/util/text/escapeHtml";
import { ResourceType } from "@esposter/db-schema";
import grapesJSMJML from "grapesjs-mjml";
import "grapesjs/dist/css/grapes.min.css";

const session = authClient.useSession();
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveDatasetReference, saveEmailEditor } = emailEditorStore;
const { datasetReference, editor: storeEditor } = storeToRefs(emailEditorStore);
const uploadFile = useUploadResourceFile(ResourceType.Email, () => emailEditorStore.resource?.id ?? "");
const { editor } = await useGrapesJsEditor(
  {
    load: () => readEmailEditor(),
    store: (data, editorInstance) => saveEmailEditor(data, editorInstance),
  },
  { plugins: [grapesJSMJML] },
  { upload: uploadFile },
);
// Bridge the live editor onto the store so the command-bar Export can reach it
watchImmediate(editor, (newEditor) => {
  storeEditor.value = newEditor;
});
const emailExportDialogStore = useEmailExportDialogStore();
const { pendingDataset } = storeToRefs(emailExportDialogStore);
// The stores outlive the blade, so anything the blade staged or bridged is torn down with it
onUnmounted(() => {
  pendingDataset.value = undefined;
  storeEditor.value = undefined;
});

const { dataset } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
const { publishedSurveys } = useReadPublishedSurveys();

watch([editor, columnNames], ([newEditor, newColumnNames]) => {
  if (!newEditor) return;
  setBlocks(
    newEditor,
    MERGE_FIELD_BLOCK_CATEGORY,
    newColumnNames.map((columnName) => ({
      content: `<mj-text>${escapeHtml(toMergeField(columnName))}</mj-text>`,
      id: `merge-field-${columnName}`,
      label: escapeHtml(columnName),
    })),
  );
});

watch([editor, publishedSurveys], ([newEditor, newPublishedSurveys]) => {
  if (!newEditor) return;
  setBlocks(newEditor, SURVEY_INVITE_BLOCK_CATEGORY, createEmailSurveyInviteBlocks(newPublishedSurveys));
});
</script>

<template>
  <div flex flex-col h-full>
    <v-toolbar v-if="session.data" density="comfortable" px-4 b-0 b-b-1 b-border b-solid>
      <DatasetReferencePicker :model-value="datasetReference" @update:model-value="saveDatasetReference($event)" />
    </v-toolbar>
    <div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 overflow-hidden />
    <!-- The export command needs this blade's live editor anyway, so its confirm lives here too -->
    <ResourceEmailExportTruncationDialog />
  </div>
</template>
