import type { Dataset } from "#shared/models/dataset/Dataset";

// Singleton dialog target for the personalized export's truncation confirm: the command bar stages the
// Capped dataset here and the Editor blade renders the decision, so a partial send is never an accident.
// Keyed by the email the export was started on: the dataset is read after an await, and staged ambiently one read for
// An email left behind would be confirmed and exported as the next email's audience
export const useEmailExportDialogStore = defineStore("emailEditor/exportDialog", () => {
  const { data: pendingDataset, getDataRef: getPendingDatasetRef } = useCurrentResourceDataMap<Dataset | undefined>(
    undefined,
  );
  const setPendingDataset = (resourceId: string, dataset: Dataset | undefined) => {
    const pendingDatasetRef = getPendingDatasetRef(resourceId);
    pendingDatasetRef.value = dataset;
  };
  return { pendingDataset, setPendingDataset };
});
