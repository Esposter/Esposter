<script setup lang="ts">
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { useWebpageEditorStore } from "@/store/webpageEditor";

const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const webpageEditorStore = useWebpageEditorStore();
const { loadContent, saveWebpage } = webpageEditorStore;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument } = pageBuilderDocumentStore;
await loadContent();
const resourceId = computed(() => resource.value?.id ?? "");
// The page builder's edits are saved through the content store's own autosave cadence, which the document's deep watch drives
watchAutosave(
  computed(() => getDocument(resourceId.value)),
  () => saveWebpage(resourceId.value),
);
</script>

<template>
  <PageBuilderEditor :kind="webpageKind" :resource-id />
</template>
