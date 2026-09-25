import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createContentData } from "@/services/resource/createContentData";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";

export const useSurveyStore = defineStore("survey", () => {
  const resourceStore = useResourceStore();
  const { getOpening, saveContent } = resourceStore;
  const { content, loadContent } = createContentData(
    ResourceType.Survey,
    (data) => data ?? { model: "", settings: surveySettingsSchema.parse({}) },
  );
  // The SurveyJS creator owns editor/preview state; the resource layer only sees model JSON in/out
  const model = computed(() => content.value.model);
  // Collection settings share the survey's single content blob, so the Overview toggle and the editor
  // Save through the same path and the same contentVersion
  const settings = computed(() => content.value.settings);
  // The content the latest save of this resource carries. Saves queue, so a half saved while the other half's
  // Write is still in flight builds on that write rather than on `content`, which would send the other half back
  // As it was before and undo it. Cleared once the latest save settles, so a failed half no later save carried
  // Is dropped rather than riding into the next one. Scoped to the opening that issued it, since a reopening of the
  // Same resource reads its own content and a save the first opening left in flight is not built on that
  let pendingSave: undefined | { content: SurveyResource; opening: symbol };
  const getLatestContent = () => (pendingSave?.opening === getOpening() ? pendingSave.content : content.value);
  // A half is taken only once the write lands, and only while the opening that issued it is still the open one —
  // Landed on another resource, it would show the first survey under the second; landed on a reopening of the
  // Same one, it would replace the content that reopening read with an older document
  const saveSurvey = async (newContent: SurveyResource) => {
    if (!resourceStore.resource) return false;

    const opening = getOpening();
    const newPendingSave = { content: newContent, opening };
    pendingSave = newPendingSave;
    const isSuccessful = await saveContent(newContent);
    if (pendingSave === newPendingSave) pendingSave = undefined;
    if (isSuccessful && getOpening() === opening) content.value = newContent;
    return isSuccessful;
  };
  const saveModel = (newModel: string) => saveSurvey({ ...getLatestContent(), model: newModel });
  const saveSettings = (newSettings: SurveySettings) => saveSurvey({ ...getLatestContent(), settings: newSettings });
  return { loadContent, model, saveModel, saveSettings, settings };
});
