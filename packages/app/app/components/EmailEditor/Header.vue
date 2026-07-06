<script setup lang="ts">
import type { Editor } from "grapesjs";

import { authClient } from "@/services/auth/authClient";
import { useEmailEditorStore } from "@/store/emailEditor";

interface EmailEditorHeaderProps {
  editor: Editor | undefined;
}

const { editor } = defineProps<EmailEditorHeaderProps>();
const session = authClient.useSession();
const emailEditorStore = useEmailEditorStore();
const { createDocument, deleteDocument, renameDocument, saveDatasetReference, selectDocument } = emailEditorStore;
const { currentDocument, datasetReference, documents } = storeToRefs(emailEditorStore);
</script>

<template>
  <v-toolbar v-if="session.data" height="auto">
    <div px-4 py-2 flex gap-2 w-full items-center>
      <DocumentPicker
        :current-document
        :documents
        @create="createDocument($event)"
        @delete="deleteDocument($event)"
        @rename="(id, name) => renameDocument(id, name)"
        @select="selectDocument($event)"
      />
      <DatasetReferencePicker :model-value="datasetReference" @update:model-value="saveDatasetReference($event)" />
      <EmailEditorExportPersonalizedHtmlButton :editor />
    </div>
  </v-toolbar>
</template>
