import { useResourceStore } from "@/store/resource";

// Singleton dialog target for the MJML import: the command bar opens the code field for the email the command ran on,
// And the Editor blade renders it, so the source is applied to the email it was opened for, never the next one
export const useEmailImportDialogStore = defineStore("emailEditor/importDialog", () => {
  const resourceStore = useResourceStore();
  const { data: isImportOpen, getDataRef: getIsImportOpenRef } = useDataMap(
    () => resourceStore.currentResourceId,
    false,
  );
  const openImport = (resourceId: string) => {
    const isImportOpenRef = getIsImportOpenRef(resourceId);
    isImportOpenRef.value = true;
  };
  const closeImport = (resourceId: string) => {
    const isImportOpenRef = getIsImportOpenRef(resourceId);
    isImportOpenRef.value = false;
  };
  return { closeImport, isImportOpen, openImport };
});
