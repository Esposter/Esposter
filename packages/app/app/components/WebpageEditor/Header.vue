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
  <StyledPageHeader>
    <template v-if="session.data" #identity>
      <DocumentPicker
        :current-document
        :documents
        @create="createDocument($event)"
        @delete="deleteDocument($event)"
        @rename="(id, name) => renameDocument(id, name)"
        @select="selectDocument($event)"
      />
    </template>
    <template v-if="session.data && currentDocument" #actions>
      <DocumentPublishButton
        :document="currentDocument"
        :view-path="RoutePath.ViewWebpage"
        @publish="publishWebpage()"
        @unpublish="unpublishWebpage()"
      />
    </template>
  </StyledPageHeader>
</template>
