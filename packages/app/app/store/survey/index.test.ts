// @vitest-environment nuxt
import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Resource } from "@esposter/db-schema";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useSurveyStore } from "@/store/survey";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useSurveyStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const model = JSON.stringify({ pages: [] });
  const newModel = JSON.stringify({ pages: [{ name: "page" }] });
  const createResource = (contentVersion = 0) =>
    ({
      contentVersion,
      id: resourceId,
      name: "name",
      type: ResourceType.Survey,
      updatedAt: new Date(0),
    }) as Resource;
  let content: SurveyResource;
  // Typed with the input the handler receives, so a test can assert what a save actually wrote
  let saveResourceContent: ReturnType<typeof vi.fn<(options: { input: { content: unknown } }) => Resource>>;
  const setupStore = async () => {
    const surveyStore = useSurveyStore();
    await surveyStore.loadContent();
    return surveyStore;
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = { model, settings: surveySettingsSchema.parse({}) };
    saveResourceContent = vi.fn<(options: { input: { content: unknown } }) => Resource>(() => createResource(1));
    server.use(
      trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null })),
      trpcMsw.survey.readResourcePublication.query(() => undefined),
      trpcMsw.survey.readResourceContent.query(() => content),
      trpcMsw.survey.saveResourceContent.mutation(saveResourceContent),
    );
  });

  // The creator autosaves on every editor change, including ones that leave the JSON identical — the store's
  // Seeded dirty check is what drops those, so the creator never has to pre-filter them itself
  test("skips a save that changed nothing since the load", async () => {
    expect.hasAssertions();

    const { saveModel } = await setupStore();
    const isSuccessful = await saveModel(model);

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("writes an edited model once", async () => {
    expect.hasAssertions();

    const surveyStore = await setupStore();
    const { saveModel } = surveyStore;
    const { model: storedModel } = storeToRefs(surveyStore);
    await saveModel(newModel);
    await saveModel(newModel);

    expect(storedModel.value).toBe(newModel);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });

  // Collection settings share the survey's single content blob, so a settings save has to carry the model
  // The editor is holding rather than dropping it back to what was last loaded
  test("writes the settings alongside the current model", async () => {
    expect.hasAssertions();

    const surveyStore = await setupStore();
    const { saveModel, saveSettings } = surveyStore;
    const { settings } = storeToRefs(surveyStore);
    await saveModel(newModel);
    await saveSettings({ ...settings.value, responseMode: SurveyResponseMode.Identified });

    expect(settings.value.responseMode).toBe(SurveyResponseMode.Identified);
    expect(saveResourceContent).toHaveBeenCalledTimes(2);
    // The count alone passes on a settings save that wrote the model back as it was loaded, which is the
    // Regression this test is named for — so the payload itself has to say newModel
    expect(saveResourceContent.mock.lastCall?.[0].input.content).toStrictEqual({
      model: newModel,
      settings: { ...surveySettingsSchema.parse({}), responseMode: SurveyResponseMode.Identified },
    });
  });
});
