import { useResourceStore } from "@/store/resource";

// Singleton dialog targets for the Responses blade's row actions (detail / delete), keyed by response id. Keyed by the
// Survey too: the delete dialog resolves no item, so a target left over from one survey would re-open it over the next
// Survey's Responses and send that survey's id with the first one's response id
export const useSurveyResponseDialogStore = defineStore("resource/surveyResponseDialog", () => {
  const resourceStore = useResourceStore();
  const { data: deletingResponseId } = useDataMap(() => resourceStore.currentResourceId, "");
  const { data: detailResponseId } = useDataMap(() => resourceStore.currentResourceId, "");
  return { deletingResponseId, detailResponseId };
});
