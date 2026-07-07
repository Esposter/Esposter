<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { Resource } from "@esposter/db-schema";
import type { Editor } from "grapesjs";

import { downloadFile } from "@/services/app/downloadFile";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { getResultAsync, noop } from "@esposter/shared";
import { strToU8, zipSync } from "fflate";

interface ExportPersonalizedHtmlButtonProps {
  editor: Editor | undefined;
}

const { editor } = defineProps<ExportPersonalizedHtmlButtonProps>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const emailEditorStore = useEmailEditorStore();
const { currentResource, datasetReference } = storeToRefs(emailEditorStore);
const exportPersonalizedHtml = async (editorValue: Editor, resource: Resource, reference: DatasetReference) => {
  const { html } = editorValue.runCommand("mjml-code-to-html") as { html: string };
  await getResultAsync(async () => {
    const dataset = await $trpc.dataset.readDataset.query(reference);
    const filename = sanitizeFilename(resource.name);
    const zip = zipSync(
      Object.fromEntries(
        dataset.rows.map((row, index) => [`${filename}-${index + 1}.html`, strToU8(substituteMergeFields(html, row))]),
      ),
    );
    downloadFile(`${filename}.zip`, zip, "application/zip");
    createAlert(`Exported ${dataset.rows.length} personalized emails`, "success");
  }).match(noop, (error) => {
    createAlert(error.message, "error");
  });
};
</script>

<template>
  <StyledTooltipIconButton
    v-if="editor && currentResource && datasetReference"
    icon="mdi-email-arrow-right"
    text="Export personalized HTML"
    @click="exportPersonalizedHtml(editor, currentResource, datasetReference)"
  />
</template>
