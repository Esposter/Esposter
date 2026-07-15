import type { Dataset } from "#shared/models/dataset/Dataset";

// Singleton dialog target for the personalized export's truncation confirm: the command bar stages the
// Capped dataset here and the Editor blade renders the decision, so a partial send is never an accident
export const useEmailExportDialogStore = defineStore("emailEditor/exportDialog", () => {
  const pendingDataset = ref<Dataset>();
  return { pendingDataset };
});
