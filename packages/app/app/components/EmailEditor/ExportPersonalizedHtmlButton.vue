<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { Document } from "@esposter/db-schema";
import type { Editor } from "grapesjs";

import { downloadFile } from "@/services/app/downloadFile";
import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { getResultAsync, noop } from "@esposter/shared";
import JSZip from "jszip";

interface ExportPersonalizedHtmlButtonProps {
  editor: Editor | undefined;
}

const { editor } = defineProps<ExportPersonalizedHtmlButtonProps>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const emailEditorStore = useEmailEditorStore();
const { currentDocument, datasetReference } = storeToRefs(emailEditorStore);
const exportPersonalizedHtml = async (editorValue: Editor, document: Document, reference: DatasetReference) => {
  const { html } = editorValue.runCommand("mjml-code-to-html") as { html: string };
  await getResultAsync(async () => {
    const dataset = await $trpc.dataset.readDataset.query(reference);
    const zip = new JSZip();
    for (const [index, row] of dataset.rows.entries())
      zip.file(`${document.name}-${index + 1}.html`, substituteMergeFields(html, row));
    downloadFile(`${document.name}.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
    createAlert(`Exported ${dataset.rows.length} personalized emails`, "success");
  }).match(noop, (error) => {
    createAlert(error.message, "error");
  });
};
</script>

<template>
  <StyledTooltipIconButton
    v-if="editor && currentDocument && datasetReference"
    icon="mdi-email-arrow-right"
    text="Export personalized HTML"
    @click="exportPersonalizedHtml(editor, currentDocument, datasetReference)"
  />
</template>
