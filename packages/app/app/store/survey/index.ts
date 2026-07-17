import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useSurveyStore = defineStore("survey", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save } = useResource(() => getRouteParamString(route.params.id));
  // The SurveyJS creator owns editor/preview state; the resource layer only sees model JSON in/out
  const model = ref("");
  // Collection settings share the survey's single content blob, so the Overview toggle and the editor
  // Save through the same path and the same contentVersion
  const settings = ref<SurveySettings>(surveySettingsSchema.parse({}));
  const loadContent = async () => {
    await load();
    // Content is untyped at the cross-type dispatch; this store owns the concrete schema
    const data = (await readContent()) as SurveyResource | undefined;
    model.value = data?.model ?? "";
    settings.value = data?.settings ?? surveySettingsSchema.parse({});
  };
  const saveModel = async (newModel: string) => {
    const isSuccessful = await save({ model: newModel, settings: settings.value } satisfies SurveyResource);
    if (isSuccessful) model.value = newModel;
    return isSuccessful;
  };
  const saveSettings = async (newSettings: SurveySettings) => {
    const isSuccessful = await save({ model: model.value, settings: newSettings } satisfies SurveyResource);
    if (isSuccessful) settings.value = newSettings;
    return isSuccessful;
  };
  return { loadContent, model, resource, saveModel, saveSettings, settings };
});
