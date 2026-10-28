<script setup lang="ts">
import { EmailView } from "@/models/pageBuilder/EmailView";
import { authClient } from "@/services/auth/authClient";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";

const session = authClient.useSession();
const emailEditorStore = useEmailEditorStore();
const { loadContent, saveDatasetReference, saveEmail } = emailEditorStore;
const { datasetReference } = storeToRefs(emailEditorStore);
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getEmailDocument, setMergeFieldColumns } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice } = pageBuilderCanvasStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
// Read before the load's await, so it names the email this blade mounted for even if the next one loads meanwhile
const resourceId = currentResourceId.value;
const emailDocument = computed(() => getEmailDocument(resourceId));
await loadContent();
// The page builder's edits are saved through the content store's own autosave cadence, which the document's deep watch drives
watchAutosave(emailDocument, () => saveEmail(resourceId));
const { dataset, error } = useDataset(() => datasetReference.value);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
// The page builder offers the bound dataset's columns as merge fields, so this blade holds them in the store under its email
watchImmediate(columnNames, (newColumnNames) => setMergeFieldColumns(resourceId, newColumnNames));
// Preview takes the design's place while it is chosen, and the design stays mounted beneath it, so its edits and selection survive
const view = ref(EmailView.Design);
const viewItems = [
  { title: "Design", value: EmailView.Design },
  { title: "Preview", value: EmailView.Preview },
];
const emailExportDialogStore = useEmailExportDialogStore();
const { setPendingDataset } = emailExportDialogStore;
// The stores outlive the blade, so the export and the merge fields staged for this email are torn down with it, since a
// Keyed swap has already loaded the next email by the time this one unmounts
onUnmounted(() => {
  setPendingDataset(resourceId, undefined);
  setMergeFieldColumns(resourceId, []);
});
</script>

<template>
  <div flex flex-col h-full>
    <div px-4 py-2 flex flex-wrap gap-4 ui-bar items-center>
      <DatasetReferencePicker
        v-if="session.data"
        :error
        :model-value="datasetReference"
        @update:model-value="saveDatasetReference($event)"
      />
      <UiToggleGroup v-model="view" :items="viewItems" label="View" />
    </div>
    <PageBuilderEditor v-show="view === EmailView.Design" :kind="emailKind" :resource-id />
    <div v-if="view === EmailView.Preview && emailDocument" p-4 flex flex-1 flex-col gap-2 min-h-0>
      <PageBuilderCanvasDeviceToggle :resource-id />
      <PageBuilderEmailPreview :device="getDevice(resourceId)" :email-document />
    </div>
    <!-- The export confirm is drawn here, since this blade holds the dataset it decides on -->
    <ResourceEmailExportTruncationDialog />
    <ResourceEmailImportDialog />
  </div>
</template>
