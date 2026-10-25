<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { MERGE_FIELD_COLUMNS_KEY } from "@/services/pageBuilder/mergeFieldColumnsKey";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";

const session = authClient.useSession();
const emailEditorStore = useEmailEditorStore();
const { loadContent, saveDatasetReference, saveEmail } = emailEditorStore;
const { datasetReference } = storeToRefs(emailEditorStore);
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getEmailDocument } = pageBuilderDocumentStore;
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
// Read before the load's await, so it names the email this blade mounted for even if the next one loads meanwhile
const resourceId = resource.value?.id ?? "";
await loadContent();
// The page builder's edits are saved through the content store's own autosave cadence, which the document's deep watch drives
watchAutosave(
  computed(() => getEmailDocument(resourceId)),
  () => saveEmail(resourceId),
);
const { dataset, error } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
// The page builder offers the bound dataset's columns as merge fields, so this blade provides them to the editor
provide(MERGE_FIELD_COLUMNS_KEY, columnNames);
const emailExportDialogStore = useEmailExportDialogStore();
const { setPendingDataset } = emailExportDialogStore;
// The stores outlive the blade, so the export staged for this email is torn down with it, since a keyed swap has already
// Loaded the next email by the time this one unmounts
onUnmounted(() => {
  setPendingDataset(resourceId, undefined);
});
</script>

<template>
  <div flex flex-col h-full>
    <div v-if="session.data" px-4 py-2 flex flex-wrap gap-4 ui-bar items-center>
      <DatasetReferencePicker
        :error
        :model-value="datasetReference"
        @update:model-value="saveDatasetReference($event)"
      />
    </div>
    <PageBuilderEditor :kind="emailKind" :resource-id />
    <!-- The export confirm is drawn here, since this blade holds the dataset it decides on -->
    <ResourceEmailExportTruncationDialog />
    <ResourceEmailImportDialog />
  </div>
</template>
