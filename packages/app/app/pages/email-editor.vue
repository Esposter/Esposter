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
import { getResultAsync, RoutePath } from "@esposter/shared";
import grapesJSMJML from "grapesjs-mjml";

defineRouteRules({ ssr: false });

const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const emailEditorStore = useEmailEditorStore();
const { readEmailEditor, saveEmailEditor } = emailEditorStore;
const { currentDocument, datasetReference } = storeToRefs(emailEditorStore);
const { editor } = await useGrapesJsEditor(
  { load: () => readEmailEditor(), store: (data) => saveEmailEditor(data) },
  { plugins: [grapesJSMJML] },
);
const { dataset } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
const publishedSurveys = ref<Except<Survey, "model">[]>([]);

watch(
  () => currentDocument.value?.id,
  () => {
    editor.value?.load();
  },
);

watchImmediate(
  () => session.value.data,
  async (newSession) => {
    if (!newSession) return;
    await getResultAsync(async () => {
      const { items } = await $trpc.survey.readSurveys.query({});
      publishedSurveys.value = items.filter(({ publishedAt }) => publishedAt);
    }).orTee((error) => createAlert(error.message, "error"));
  },
);

watch([editor, columnNames], ([newEditor, newColumnNames]) => {
  if (!newEditor) return;
  setBlocks(
    newEditor,
    MERGE_FIELD_BLOCK_CATEGORY,
    newColumnNames.map((columnName) => ({
      content: `<mj-text>${toMergeField(columnName)}</mj-text>`,
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
  <NuxtLayout>
    <div flex flex-col h-full>
      <EmailEditorHeader :editor />
      <div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 overflow-hidden />
    </div>
  </NuxtLayout>
</template>

<style lang="scss">
@use "grapesjs/dist/css/grapes.min.css";
</style>
