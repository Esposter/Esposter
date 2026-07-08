<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { authClient } from "@/services/auth/authClient";
import { MERGE_FIELD_BLOCK_CATEGORY, SURVEY_INVITE_BLOCK_CATEGORY } from "@/services/emailEditor/constants";
import { toMergeField } from "@/services/emailEditor/toMergeField";
import { GRAPES_JS_EDITOR_CONTAINER_ID } from "@/services/grapesjs/constants";
import { setBlocks } from "@/services/grapesjs/setBlocks";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { escapeHtml } from "@/util/text/escapeHtml";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";
import grapesJSMJML from "grapesjs-mjml";

const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const { createAlert } = useAlertStore();
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveDatasetReference, saveEmailEditor } = emailEditorStore;
const { datasetReference, editor: storeEditor } = storeToRefs(emailEditorStore);
const { editor } = await useGrapesJsEditor(
  { load: () => readEmailEditor(), store: (data) => saveEmailEditor(data) },
  { plugins: [grapesJSMJML] },
);
// Bridge the live editor onto the store so the command-bar Export can reach it
watchImmediate(editor, (newEditor) => {
  storeEditor.value = newEditor;
});

const { dataset } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
const publishedSurveys = ref<Except<Survey, "model">[]>([]);

watchImmediate(
  () => session.value.data,
  async (newSession) => {
    if (!newSession) return;
    await getResultAsync(async () => {
      const { items } = await $trpc.survey.readSurveys.query();
      publishedSurveys.value = items.filter(({ publishedAt }) => publishedAt);
    }).match(noop, (error) => createAlert(error.message, "error"));
  },
);

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
  setBlocks(
    newEditor,
    SURVEY_INVITE_BLOCK_CATEGORY,
    newPublishedSurveys.map(({ id, name }) => ({
      content: `<mj-button background-color="#F63A4D" href="${window.location.origin}${RoutePath.Survey(id)}">${escapeHtml(name)}</mj-button>`,
      id: `survey-invite-${id}`,
      label: escapeHtml(name),
    })),
  );
});
</script>

<template>
  <div flex flex-col h-full>
    <v-toolbar v-if="session.data" density="comfortable" px-4 b-b-1 b-border b-solid>
      <DatasetReferencePicker :model-value="datasetReference" @update:model-value="saveDatasetReference($event)" />
    </v-toolbar>
    <div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 overflow-hidden />
  </div>
</template>

<style lang="scss">
@use "grapesjs/dist/css/grapes.min.css";
</style>
