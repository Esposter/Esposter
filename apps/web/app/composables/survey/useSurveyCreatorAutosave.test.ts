// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyDocument } from "headless-survey-engine";

import { useSurveyCreatorAutosave } from "@/composables/survey/useSurveyCreatorAutosave";
import { useSurveyCreatorCommands } from "@/composables/survey/useSurveyCreatorCommands";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { createSurveyDocument } from "headless-survey-engine";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useSurveyCreatorAutosave, () => {
  const resourceId = crypto.randomUUID();
  let save: ReturnType<typeof vi.fn<(document: SurveyDocument) => Promise<boolean>>>;
  let wrapper: VueWrapper;
  const autosaveHost = defineComponent({
    render: () => h("div"),
    setup: () => {
      useSurveyCreatorAutosave(save);
    },
  });
  const mountAutosave = async () => {
    wrapper = await mountSuspended(autosaveHost);
    // Mounting resets the route, so the resource the edits are made on is named once the blade is up
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    // Only the timer is faked, so the promises a save resolves through still settle while the test waits on them
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  };

  beforeEach(() => {
    save = vi.fn<(document: SurveyDocument) => Promise<boolean>>().mockResolvedValue(true);
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
  });

  afterEach(() => {
    vi.useRealTimers();
    wrapper.unmount();
  });

  test("saves once with the latest document after rapid edits", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    const { document } = storeToRefs(surveyCreatorStore);
    await mountAutosave();
    const { updateRootProps } = useSurveyCreatorCommands();
    updateRootProps({ title: "a" });
    updateRootProps({ title: "ab" });
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await waitForSynchronizedFunctions();

    expect(save).toHaveBeenCalledExactlyOnceWith(document.value);
  });

  test("holds an edit made during a save until that save settles, then saves the latest document", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    const { document } = storeToRefs(surveyCreatorStore);
    const firstSave = Promise.withResolvers<boolean>();
    save.mockReturnValueOnce(firstSave.promise);
    await mountAutosave();
    const { updateRootProps } = useSurveyCreatorCommands();
    updateRootProps({ title: "a" });
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await flushPromises();
    updateRootProps({ title: "ab" });
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await flushPromises();

    expect(save).toHaveBeenCalledTimes(1);

    firstSave.resolve(true);
    await waitForSynchronizedFunctions();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(document.value);
  });
});
