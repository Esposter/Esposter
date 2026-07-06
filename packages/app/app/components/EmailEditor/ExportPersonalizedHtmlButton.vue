<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { Document } from "@esposter/db-schema";
import type { Editor } from "grapesjs";

import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { getResultAsync } from "@esposter/shared";

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
  if (!("showDirectoryPicker" in window)) {
    createAlert("Your browser does not support exporting to a directory", "error");
    return;
  }

  const { html } = editorValue.runCommand("mjml-get-code") as { html: string };
  await getResultAsync(async () => {
    const dataset = await $trpc.dataset.readDataset.query(reference);
    const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    for (const [index, row] of dataset.rows.entries()) {
      const fileHandle = await directoryHandle.getFileHandle(`${document.name}-${index + 1}.html`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(substituteMergeFields(html, row));
      await writable.close();
    }
    createAlert(`Exported ${dataset.rows.length} personalized emails`, "success");
  }).orTee((error) => {
    if (error.name === "AbortError") return;
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
