// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// The debounce, its scope cleanup and its resource binding are useAutosaveFunction's, and their matrix lives in that
// File's test; here only the wiring — a nested edit reaches the same cadence
describe(watchAutosave, () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  test("saves a nested edit on the shared cadence", async () => {
    expect.hasAssertions();

    const save = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const source = reactive({ configuration: { delimiter: "" } });
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          watchAutosave(source, save);
        },
      }),
    );
    vi.useFakeTimers({ now: 0 });
    source.configuration.delimiter = " ";
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await waitForSynchronizedFunctions();

    expect(save).toHaveBeenCalledExactlyOnceWith();
  });
});
