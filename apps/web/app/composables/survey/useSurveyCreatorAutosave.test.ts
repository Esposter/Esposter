// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { useSurveyCreatorAutosave } from "#src/composables/survey/useSurveyCreatorAutosave";
import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "#src/services/resource/constants";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createSurveyDocument } from "vue-survey-engine-headless";

describe(useSurveyCreatorAutosave, () => {
  const resourceId = v7();
  let save: ReturnType<typeof vi.fn<(document: SurveyDocument) => void>>;
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
    save = vi.fn<(document: SurveyDocument) => void>();
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
});
