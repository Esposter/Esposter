<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { EMAIL_PREVIEW_TEXT_INBOX_LENGTH, MERGE_FIELD_BLOCK_CATEGORY } from "@/services/emailEditor/constants";
import { createEmailSurveyInviteBlocks } from "@/services/emailEditor/createEmailSurveyInviteBlocks";
import { createMergeFieldBlocks } from "@/services/emailEditor/createMergeFieldBlocks";
import { readEmailPreviewText } from "@/services/emailEditor/readEmailPreviewText";
import { writeEmailPreviewText } from "@/services/emailEditor/writeEmailPreviewText";
import { GRAPES_JS_EDITOR_CONTAINER_ID } from "@/services/grapesjs/constants";
import { setBlocks } from "@/services/grapesjs/setBlocks";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import grapesJSMJML from "grapesjs-mjml";
import "grapesjs/dist/css/grapes.min.css";

const session = authClient.useSession();
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveDatasetReference, saveEmailEditor } = emailEditorStore;
const { datasetReference, editor: storeEditor } = storeToRefs(emailEditorStore);
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
// Read before the editor's await, so it names the email this blade mounted for even if the next one loads meanwhile
const resourceId = resource.value?.id ?? "";
const uploadFile = useUploadResourceFile(ResourceType.Email, () => resource.value?.id ?? "");
const { editor } = await useGrapesJsEditor(
  ResourceType.Email,
  { load: () => readEmailEditor(), store: (data, editorInstance) => saveEmailEditor(data, editorInstance) },
  { plugins: [grapesJSMJML] },
  { upload: uploadFile },
);
// Bridge the live editor onto the store so the command-bar Export can reach it
watchImmediate(editor, (newEditor) => {
  storeEditor.value = newEditor;
});
// The preview text lives in the email's MJML, so the field reads it back after every change — an undo included
const previewText = ref("");
watchImmediate(editor, (newEditor, _oldEditor, onCleanup) => {
  if (!newEditor) return;
  const readPreviewText = () => {
    previewText.value = readEmailPreviewText(newEditor);
  };
  readPreviewText();
  newEditor.on("update", readPreviewText);
  onCleanup(() => newEditor.off("update", readPreviewText));
});
const emailExportDialogStore = useEmailExportDialogStore();
const { setPendingDataset } = emailExportDialogStore;
// The stores outlive the blade, so anything the blade staged or bridged is torn down with it — the staged export by
// The email it was staged for, since a keyed swap has already loaded the next email by the time this one unmounts
onUnmounted(() => {
  setPendingDataset(resourceId, undefined);
  storeEditor.value = undefined;
});

const { dataset } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
const { publishedSurveys } = useReadPublishedSurveys();
// A session-driven editor re-init drops every registered block, so both categories re-sync off the editor too
watch([editor, columnNames], ([newEditor, newColumnNames]) => {
  if (!newEditor) return;
  setBlocks(newEditor, MERGE_FIELD_BLOCK_CATEGORY, createMergeFieldBlocks(newColumnNames));
});

useSurveyInviteBlocks(editor, publishedSurveys, createEmailSurveyInviteBlocks);
</script>

<template>
  <div flex flex-col h-full>
    <div v-if="session.data" px-4 py-2 flex flex-wrap gap-4 ui-bar items-center>
      <DatasetReferencePicker :model-value="datasetReference" @update:model-value="saveDatasetReference($event)" />
      <!-- The line an inbox shows under the subject; without it an inbox shows the first words of the body -->
      <div v-if="editor" flex-1 min-w-0>
        <UiTextField
          :counter="EMAIL_PREVIEW_TEXT_INBOX_LENGTH"
          :hint="
            previewText.length > EMAIL_PREVIEW_TEXT_INBOX_LENGTH ? 'Most inboxes cut the line around here' : undefined
          "
          label="Preview text"
          :model-value="previewText"
          @update:model-value="
            (newPreviewText) => {
              previewText = newPreviewText;
              writeEmailPreviewText(editor, newPreviewText);
            }
          "
        />
      </div>
    </div>
    <div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 of-hidden />
    <!-- The export command needs this blade's live editor anyway, so its confirm lives here too -->
    <ResourceEmailExportTruncationDialog />
  </div>
</template>
