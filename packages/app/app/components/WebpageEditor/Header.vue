<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { RoutePath } from "@esposter/shared";

const session = authClient.useSession();
const webpageEditorStore = useWebpageEditorStore();
const { createDocument, deleteDocument, publishWebpage, renameDocument, selectDocument, unpublishWebpage } =
  webpageEditorStore;
const { currentDocument, documents } = storeToRefs(webpageEditorStore);
</script>

<template>
  <v-toolbar v-if="session.data" height="auto">
    <div flex gap-2 items-center w-full px-4 py-2>
      <DocumentPicker
        :current-document
        :documents
        @create="createDocument($event)"
        @delete="deleteDocument($event)"
        @rename="(id, name) => renameDocument(id, name)"
        @select="selectDocument($event)"
      />
      <DocumentPublishButton
        v-if="currentDocument"
        :document="currentDocument"
        :view-path="RoutePath.ViewWebpage"
        @publish="publishWebpage()"
        @unpublish="unpublishWebpage()"
      />
    </div>
  </v-toolbar>
</template>
