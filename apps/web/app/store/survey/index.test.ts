// @vitest-environment nuxt
import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { useSurveyStore } from "#src/store/survey/index";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createSurveyDocument } from "vue-survey-engine-headless";

const setupStore = async () => {
  const surveyStore = useSurveyStore();
  const { loadContent } = surveyStore;
  await loadContent();
  return surveyStore;
};

describe(useSurveyStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const document = createSurveyDocument();
  const newDocument: SurveyDocument = { ...document, root: { props: { ...document.root.props, title: "edited" } } };
  const identifiedNewDocumentContent = {
    document: newDocument,
    settings: { ...surveySettingsSchema.parse({}), responseMode: SurveyResponseMode.Identified },
  };
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Survey });
  let content: SurveyResource;
  // Typed with the input the handler receives, so a test can assert what a save actually wrote
  let saveResourceContent: ReturnType<typeof vi.fn<(options: { input: { content: unknown } }) => ResourceInResource>>;

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    content = { document, settings: surveySettingsSchema.parse({}) };
    saveResourceContent = vi.fn<(options: { input: { content: unknown } }) => ResourceInResource>(() =>
      createResource(1),
    );
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.survey.readResourcePublication.query(() => undefined);
    trpcMsw.survey.readResourceContent.query(() => content);
    trpcMsw.survey.saveResourceContent.mutation(saveResourceContent);
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  // The creator autosaves on every editor change, including ones that leave the JSON identical — the store's
  // Seeded dirty check is what drops those, so the creator never has to pre-filter them itself
  test("skips a save that changed nothing since the load", async () => {
    expect.hasAssertions();

    const { saveDocument } = await setupStore();
    saveDocument(document);
    await flushPromises();

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("writes an edited document once", async () => {
    expect.hasAssertions();

    const surveyStore = await setupStore();
    const { saveDocument } = surveyStore;
    const { document: storedDocument } = storeToRefs(surveyStore);
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    saveDocument(newDocument);
    // The first save's answer is the version it leaves the resource on, which is what the second save is checked against
    await until(() => resource.value?.contentVersion).toBe(1);
    await flushPromises();
    saveDocument(newDocument);
    await flushPromises();

    expect(storedDocument.value).toStrictEqual(newDocument);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });

  // The save is keyed by the survey it writes, so it can be refused after the blade opened another survey. Its rollback
  // Then puts back the content of the survey it wrote into, which would show this one's document, and the next settings
  // Save would write it back
  test("leaves the survey opened since alone when a refused save lands late", async () => {
    expect.hasAssertions();

    const otherResourceId = v7();
    const otherContent = { document: createSurveyDocument(), settings: surveySettingsSchema.parse({}) };
    const { promise: saveGate, resolve: releaseSave } = Promise.withResolvers<void>();
    const { promise: isSaveReached, resolve: onSaveReached } = Promise.withResolvers<void>();
    trpcMsw.resource.readResource.query(({ input }) => ({ ...createResource(), id: input.id, publication: null }));
    trpcMsw.survey.readResourceContent.query(({ input }) => (input.id === resourceId ? content : otherContent));
    trpcMsw.survey.saveResourceContent.mutation(async () => {
      onSaveReached();
      await saveGate;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const surveyStore = await setupStore();
    const { loadContent, saveDocument } = surveyStore;
    const { document: storedDocument } = storeToRefs(surveyStore);
    saveDocument(newDocument);
    Object.assign(useRouter().currentRoute.value.params, { id: otherResourceId });
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    await loadContent();
    await isSaveReached;
    releaseSave();
    await flushPromises();

    expect(storedDocument.value).toStrictEqual(otherContent.document);
  });

  // Collection settings share the survey's single content blob, so a settings save has to carry the document
  // The editor is holding rather than dropping it back to what was last loaded
  test("writes the settings alongside the current document", async () => {
    expect.hasAssertions();

    const surveyStore = await setupStore();
    const { saveDocument, saveSettings } = surveyStore;
    const { settings } = storeToRefs(surveyStore);
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    saveDocument(newDocument);
    await until(() => resource.value?.contentVersion).toBe(1);
    await flushPromises();
    const { promise: isSettingsSaveReached, resolve: onSettingsSaveReached } = Promise.withResolvers<void>();
    saveResourceContent.mockImplementationOnce(() => {
      onSettingsSaveReached();
      return createResource(1);
    });
    saveSettings({ ...settings.value, responseMode: SurveyResponseMode.Identified });
    await isSettingsSaveReached;
    await flushPromises();

    expect(settings.value.responseMode).toBe(SurveyResponseMode.Identified);
    expect(saveResourceContent).toHaveBeenCalledTimes(2);
    // The count alone passes on a settings save that wrote the document back as it was loaded, which is the
    // Regression this test is named for — so the payload itself has to carry newDocument
    expect(saveResourceContent.mock.lastCall?.[0].input.content).toStrictEqual(identifiedNewDocumentContent);
  });

  // Saves of one resource queue, so a settings save issued while the document's write is in flight is sent after it —
  // Built from the document as last landed, it would write the old document back over the edit just saved
  test("keeps an in-flight document edit when the settings save overlaps it", async () => {
    expect.hasAssertions();

    const surveyStore = await setupStore();
    const { saveDocument, saveSettings } = surveyStore;
    const { document: storedDocument, settings } = storeToRefs(surveyStore);
    // The settings save queues behind the document's, so its request is the second one the mock answers
    const { promise: isSettingsSaveReached, resolve: onSettingsSaveReached } = Promise.withResolvers<void>();
    saveResourceContent.mockReturnValueOnce(createResource(1)).mockImplementationOnce(() => {
      onSettingsSaveReached();
      return createResource(1);
    });
    saveDocument(newDocument);
    saveSettings({ ...settings.value, responseMode: SurveyResponseMode.Identified });
    await isSettingsSaveReached;
    await flushPromises();

    expect(storedDocument.value).toStrictEqual(newDocument);
    expect(saveResourceContent.mock.lastCall?.[0].input.content).toStrictEqual(identifiedNewDocumentContent);
  });

  // A read issued for one resource can land after the blade opened another, and adopted it would show the first
  // Survey under the second
  test("discards a content read that lands after another resource opened", async () => {
    expect.hasAssertions();

    const otherResourceId = v7();
    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    trpcMsw.resource.readResource.query(({ input }) => ({ ...createResource(), id: input.id, publication: null }));
    trpcMsw.survey.readResourceContent.query(async ({ input }) => {
      if (input.id !== resourceId) return { ...content, document: newDocument };
      onReadReached();
      await readGate;
      return content;
    });
    const surveyStore = useSurveyStore();
    const { loadContent } = surveyStore;
    const { document: storedDocument } = storeToRefs(surveyStore);
    const pendingLoad = loadContent();
    // A read issued in the same tick would share the held one's batch and settle with it
    await isReadReached;
    Object.assign(useRouter().currentRoute.value.params, { id: otherResourceId });
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    await loadContent();
    releaseRead();
    await pendingLoad;

    expect(storedDocument.value).toStrictEqual(newDocument);
  });

  // Closing a survey and reopening it loads the same id, so a read the first opening issued would land on the
  // Reopened blade as its own — showing content older than the row it just read, under that row's contentVersion
  test("discards a content read that lands after the resource was closed and reopened", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    let readCount = 0;
    trpcMsw.survey.readResourceContent.query(async () => {
      readCount++;
      if (readCount > 1) return { ...content, document: newDocument };
      onReadReached();
      await readGate;
      return content;
    });
    const surveyStore = useSurveyStore();
    const { loadContent } = surveyStore;
    const { document: storedDocument } = storeToRefs(surveyStore);
    const pendingLoad = loadContent();
    // A read issued in the same tick would share the held one's batch and settle with it
    await isReadReached;
    const resourceStore = useResourceStore();
    const { clearResource, readResource } = resourceStore;
    clearResource(resourceId);
    await readResource();
    await loadContent();
    releaseRead();
    await pendingLoad;

    expect(storedDocument.value).toStrictEqual(newDocument);
  });

  // A restore re-reads the content within the one opening, so a read issued before it that lands after its re-read
  // Would put the pre-restore document back, under the baseline the restore just persisted
  test("discards a content read that a restore's re-read overtook", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    let readCount = 0;
    trpcMsw.survey.readResourceContent.query(async () => {
      readCount++;
      if (readCount > 1) return { ...content, document: newDocument };
      onReadReached();
      await readGate;
      return content;
    });
    const surveyStore = useSurveyStore();
    const { loadContent } = surveyStore;
    const { document: storedDocument } = storeToRefs(surveyStore);
    const pendingLoad = loadContent();
    // A read issued in the same tick would share the held one's batch and settle with it
    await isReadReached;
    const resourceStore = useResourceStore();
    const { reloadResourceContent } = resourceStore;
    await reloadResourceContent();
    releaseRead();
    await pendingLoad;

    expect(storedDocument.value).toStrictEqual(newDocument);
  });

  // A reopening reads its own content, so a save the first opening left in flight is not what the reopened blade's
  // Next save builds on
  test("builds a reopened survey's save on its own content rather than the previous opening's save", async () => {
    expect.hasAssertions();

    const { promise: saveGate, resolve: releaseSave } = Promise.withResolvers<void>();
    const { promise: isSettingsSaveReached, resolve: onSettingsSaveReached } = Promise.withResolvers<void>();
    let saveCount = 0;
    trpcMsw.survey.saveResourceContent.mutation(async (options) => {
      saveCount++;
      if (saveCount === 2) onSettingsSaveReached();
      await saveGate;
      return saveResourceContent(options);
    });
    const surveyStore = await setupStore();
    const { loadContent, saveDocument, saveSettings } = surveyStore;
    const { settings } = storeToRefs(surveyStore);
    saveDocument(newDocument);
    const resourceStore = useResourceStore();
    const { clearResource, readResource } = resourceStore;
    clearResource(resourceId);
    await readResource();
    await loadContent();
    saveSettings({ ...settings.value, responseMode: SurveyResponseMode.Identified });
    releaseSave();
    await isSettingsSaveReached;
    await flushPromises();

    expect(saveResourceContent.mock.lastCall?.[0].input.content).toStrictEqual({
      document,
      settings: { ...surveySettingsSchema.parse({}), responseMode: SurveyResponseMode.Identified },
    });
  });
});
