// Singleton dialog targets for the Responses blade's row actions (detail / delete), keyed by row key
export const useSurveyResponseDialogStore = defineStore("resource/surveyResponseDialog", () => {
  const deletingRowKey = ref("");
  const detailRowKey = ref("");
  return { deletingRowKey, detailRowKey };
});
