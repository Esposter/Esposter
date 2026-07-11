import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";

export const useSurveyStore = defineStore("survey", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save } = useResource(() =>
    Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  );
  // The SurveyJS creator owns editor/preview state; the resource layer only sees model JSON in/out
  const model = ref("");
  const loadContent = async () => {
    await load();
    // Content is untyped at the cross-type dispatch; this store owns the concrete schema
    const data = (await readContent()) as SurveyResource | undefined;
    model.value = data?.model ?? "";
  };
  const saveModel = async (newModel: string) => {
    const isSuccessful = await save({ model: newModel } satisfies SurveyResource);
    if (isSuccessful) model.value = newModel;
    return isSuccessful;
  };
  return { loadContent, model, resource, saveModel };
});
