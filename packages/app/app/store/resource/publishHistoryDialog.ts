// Singleton dialog target for the Publish history blade's restore confirm — the id of the snapshot row being
// Restored, which is its channel and version together: a version alone names one row per channel
export const usePublishHistoryDialogStore = defineStore("resource/publishHistoryDialog", () => {
  const restoringSnapshotVersionId = ref("");
  return { restoringSnapshotVersionId };
});
