<script setup lang="ts">
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { useWebpageEditorStore } from "@/store/webpageEditor";

const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const webpageEditorStore = useWebpageEditorStore();
const { loadContent, saveWebpage } = webpageEditorStore;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument } = pageBuilderDocumentStore;
await loadContent();
// The page builder's edits are saved through the content store's own autosave cadence, which the document's deep watch drives
watchAutosave(
  computed(() => getDocument(currentResourceId.value)),
  () => saveWebpage(currentResourceId.value),
);
</script>

<template>
  <PageBuilderEditor :kind="webpageKind" :resource-id="currentResourceId" />
</template>
