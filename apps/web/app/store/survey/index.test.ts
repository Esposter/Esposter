// @vitest-environment nuxt
import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Resource } from "@esposter/db-schema";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useSurveyStore } from "@/store/survey";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const setupStore = async () => {
  const surveyStore = useSurveyStore();
  const { loadContent } = surveyStore;
  await loadContent();
  return surveyStore;
};

describe(useSurveyStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const model = JSON.stringify({ pages: [] });
  const newModel = JSON.stringify({ pages: [{ name: "" }] });
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

  beforeEach(async () => {
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
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
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

  // Saves of one resource queue, so a settings save issued while the model's write is in flight is sent after it —
  // Built from the model as last landed, it would write the old model back over the edit just saved
  test("keeps an in-flight model edit when the settings save overlaps it", async () => {
    expect.hasAssertions();

    const surveyStore = await setupStore();
    const { saveModel, saveSettings } = surveyStore;
    const { model: storedModel, settings } = storeToRefs(surveyStore);
    await Promise.all([
      saveModel(newModel),
      saveSettings({ ...settings.value, responseMode: SurveyResponseMode.Identified }),
    ]);

    expect(storedModel.value).toBe(newModel);
    expect(saveResourceContent.mock.lastCall?.[0].input.content).toStrictEqual({
      model: newModel,
      settings: { ...surveySettingsSchema.parse({}), responseMode: SurveyResponseMode.Identified },
    });
  });

  // A read issued for one resource can land after the blade opened another, and adopted it would show the first
  // Survey under the second
  test("discards a content read that lands after another resource opened", async () => {
    expect.hasAssertions();

    const otherResourceId = crypto.randomUUID();
    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({ ...createResource(), id: input.id, publication: null })),
      trpcMsw.survey.readResourceContent.query(async ({ input }) => {
        if (input.id === resourceId) await readGate;
        return input.id === resourceId ? content : { ...content, model: newModel };
      }),
    );
    const surveyStore = useSurveyStore();
    const { loadContent } = surveyStore;
    const { model: storedModel } = storeToRefs(surveyStore);
    const pendingLoad = loadContent();
    useRouter().currentRoute.value.params.id = otherResourceId;
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    await loadContent();
    releaseRead();
    await pendingLoad;

    expect(storedModel.value).toBe(newModel);
  });

  // Closing a survey and reopening it loads the same id, so a read the first opening issued would land on the
  // Reopened blade as its own — showing content older than the row it just read, under that row's contentVersion
  test("discards a content read that lands after the resource was closed and reopened", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    let readCount = 0;
    server.use(
      trpcMsw.survey.readResourceContent.query(async () => {
        readCount++;
        if (readCount > 1) return { ...content, model: newModel };
        await readGate;
        return content;
      }),
    );
    const surveyStore = useSurveyStore();
    const { loadContent } = surveyStore;
    const { model: storedModel } = storeToRefs(surveyStore);
    const pendingLoad = loadContent();
    const resourceStore = useResourceStore();
    const { clearResource, readResource } = resourceStore;
    clearResource(resourceId);
    await readResource();
    await loadContent();
    releaseRead();
    await pendingLoad;

    expect(storedModel.value).toBe(newModel);
  });

  // A restore re-reads the content within the one opening, so a read issued before it that lands after its re-read
  // Would put the pre-restore document back, under the baseline the restore just persisted
  test("discards a content read that a restore's re-read overtook", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    let readCount = 0;
    server.use(
      trpcMsw.survey.readResourceContent.query(async () => {
        readCount++;
        if (readCount > 1) return { ...content, model: newModel };
        await readGate;
        return content;
      }),
    );
    const surveyStore = useSurveyStore();
    const { loadContent } = surveyStore;
    const { model: storedModel } = storeToRefs(surveyStore);
    const pendingLoad = loadContent();
    const resourceStore = useResourceStore();
    const { reloadResourceContent } = resourceStore;
    await reloadResourceContent();
    releaseRead();
    await pendingLoad;

    expect(storedModel.value).toBe(newModel);
  });

  // A reopening reads its own content, so a save the first opening left in flight is not what the reopened blade's
  // Next save builds on
  test("builds a reopened survey's save on its own content rather than the previous opening's save", async () => {
    expect.hasAssertions();

    const { promise: saveGate, resolve: releaseSave } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.survey.saveResourceContent.mutation(async (options) => {
        await saveGate;
        return saveResourceContent(options);
      }),
    );
    const surveyStore = await setupStore();
    const { loadContent, saveModel, saveSettings } = surveyStore;
    const { settings } = storeToRefs(surveyStore);
    const pendingModelSave = saveModel(newModel);
    const resourceStore = useResourceStore();
    const { clearResource, readResource } = resourceStore;
    clearResource(resourceId);
    await readResource();
    await loadContent();
    const pendingSettingsSave = saveSettings({ ...settings.value, responseMode: SurveyResponseMode.Identified });
    releaseSave();
    await Promise.all([pendingModelSave, pendingSettingsSave]);

    expect(saveResourceContent.mock.lastCall?.[0].input.content).toStrictEqual({
      model,
      settings: { ...surveySettingsSchema.parse({}), responseMode: SurveyResponseMode.Identified },
    });
  });
});
