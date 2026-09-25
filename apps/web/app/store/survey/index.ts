import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createContentData } from "@/services/resource/createContentData";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";

export const useSurveyStore = defineStore("survey", () => {
  const resourceStore = useResourceStore();
  const { saveContent } = resourceStore;
  const { content, loadContent } = createContentData(
    ResourceType.Survey,
    (data) => data ?? { model: "", settings: surveySettingsSchema.parse({}) },
  );
  // The SurveyJS creator owns editor/preview state; the resource layer only sees model JSON in/out
  const model = computed(() => content.value.model);
  // Collection settings share the survey's single content blob, so the Overview toggle and the editor
  // Save through the same path and the same contentVersion
  const settings = computed(() => content.value.settings);
  // A half is taken only once the write lands, so the other half's save always carries what is persisted
  const saveSurvey = async (newContent: SurveyResource) => {
    const isSuccessful = await saveContent(newContent);
    if (isSuccessful) content.value = newContent;
    return isSuccessful;
  };
  const saveModel = (newModel: string) => saveSurvey({ model: newModel, settings: settings.value });
  const saveSettings = (newSettings: SurveySettings) => saveSurvey({ model: model.value, settings: newSettings });
  return { loadContent, model, saveModel, saveSettings, settings };
});
