import { useResourceStore } from "@/store/resource";

// Singleton dialog targets for the Responses blade's row actions (detail / delete), keyed by row key. Keyed by the
// Survey too: the delete dialog resolves no item, so a target left over from one survey would re-open it over the next
// Survey's Responses and send that survey's id with the first one's row key
export const useSurveyResponseDialogStore = defineStore("resource/surveyResponseDialog", () => {
  const resourceStore = useResourceStore();
  const { data: deletingRowKey } = useDataMap(() => resourceStore.currentResourceId, "");
  const { data: detailRowKey } = useDataMap(() => resourceStore.currentResourceId, "");
  return { deletingRowKey, detailRowKey };
});
