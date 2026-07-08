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
const { saveDatasetReference } = emailEditorStore;
const { datasetReference } = storeToRefs(emailEditorStore);
</script>

<template>
  <StyledPageHeader>
    <template v-if="session.data" #filters>
      <DatasetReferencePicker :model-value="datasetReference" @update:model-value="saveDatasetReference($event)" />
    </template>
    <template v-if="session.data" #actions>
      <EmailEditorExportPersonalizedHtmlButton :editor />
    </template>
  </StyledPageHeader>
</template>
