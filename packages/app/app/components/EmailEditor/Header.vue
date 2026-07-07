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
const { createResource, deleteResource, renameResource, saveDatasetReference, selectResource } = emailEditorStore;
const { currentResource, datasetReference, resources } = storeToRefs(emailEditorStore);
</script>

<template>
  <StyledPageHeader>
    <template v-if="session.data" #identity>
      <ResourcePicker
        :current-resource
        :resources
        @create="createResource($event)"
        @delete="deleteResource($event)"
        @rename="(id, name) => renameResource(id, name)"
        @select="selectResource($event)"
      />
    </template>
    <template v-if="session.data" #filters>
      <DatasetReferencePicker :model-value="datasetReference" @update:model-value="saveDatasetReference($event)" />
    </template>
    <template v-if="session.data" #actions>
      <EmailEditorExportPersonalizedHtmlButton :editor />
    </template>
  </StyledPageHeader>
</template>
