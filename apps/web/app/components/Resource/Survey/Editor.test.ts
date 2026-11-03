// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";
import type { SurveyDocument } from "survey-engine";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceSurveyEditor from "@/components/Resource/Survey/Editor.vue";
import { useSurveyCreatorCommands } from "@/composables/survey/useSurveyCreatorCommands";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { ResourceType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { checkSurveyDocument } from "survey-engine";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { sweepMock, trackMock } = vi.hoisted(() => ({
  sweepMock: vi.fn<(document: SurveyDocument) => Promise<void>>(),
  trackMock: vi.fn<(document: SurveyDocument) => void>(),
}));

// The file sweep is covered by useSurveyFiles's own suite, so it is mocked at its seam here
vi.mock(import("@/composables/survey/useSurveyFiles"), () => ({
  useSurveyFiles: () => ({
    sweep: sweepMock,
    track: trackMock,
    upload: vi.fn<() => Promise<string | undefined>>(),
    uploadPicked: vi.fn<() => Promise<void>>(),
  }),
}));

describe("resourceSurveyEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const surveyDocument = createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("a")])]);
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Survey });
  // Typed with the input the handler receives, so a test can assert what a save actually wrote
  let saveResourceContent: ReturnType<typeof vi.fn<(options: { input: { content: unknown } }) => ResourceInResource>>;

  beforeEach(async () => {
    sweepMock.mockClear();
    trackMock.mockClear();
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    saveResourceContent = vi.fn<(options: { input: { content: unknown } }) => ResourceInResource>(() =>
      createResource(1),
    );
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.survey.readResourcePublication.query(() => undefined);
    trpcMsw.survey.readResourceContent.query(() => ({
      document: surveyDocument,
      settings: surveySettingsSchema.parse({}),
    }));
    trpcMsw.survey.saveResourceContent.mutation(saveResourceContent);
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("the loaded document is the one the creator holds, and its files are tracked", async () => {
    expect.hasAssertions();

    await mountSuspended(ResourceSurveyEditor);
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: creatorDocument } = storeToRefs(surveyCreatorStore);

    expect(creatorDocument.value).toStrictEqual(surveyDocument);
    expect(trackMock).toHaveBeenCalledExactlyOnceWith(surveyDocument);
  });

  // Mounting resets the route, so the edit's resource is named once the blade is up, as the autosave suite does
  test("a document the survey check refuses is not saved, and its first issue is shown", async () => {
    expect.hasAssertions();

    await mountSuspended(ResourceSurveyEditor);
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: creatorDocument } = storeToRefs(surveyCreatorStore);
    // Two questions sharing a name is a refusal the check reports, which no creator edit leaves in the document
    const duplicateDocument = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("a"), createSurveyTestQuestion("a")]),
    ]);
    const [firstIssue] = checkSurveyDocument(duplicateDocument);
    creatorDocument.value = duplicateDocument;
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await waitForSynchronizedFunctions();
    await flushPromises();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);

    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(alerts.value.map(({ text }) => text)).toStrictEqual([`${firstIssue?.pointer}: ${firstIssue?.message}`]);
  });

  test("closing the editor sweeps the document as it stands, once", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyEditor);
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: creatorDocument } = storeToRefs(surveyCreatorStore);
    const { updateRootProps } = useSurveyCreatorCommands();
    updateRootProps({ title: "a" });
    component.unmount();

    expect(sweepMock).toHaveBeenCalledExactlyOnceWith(creatorDocument.value);
  });
});
