// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { useResourceStore } from "@/store/resource";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const elapseDebounce = async () => {
  vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
  await waitForSynchronizedFunctions();
};

describe(useAutosaveFunction, () => {
  let router: Router;
  let wrapper: VueWrapper;
  let save: ReturnType<typeof vi.fn<() => Promise<void>>>;
  let autosave: () => void;
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
  const mountAutosave = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          autosave = useAutosaveFunction(save);
        },
      }),
    );
    vi.useFakeTimers({ now: 0 });
  };

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    save = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    router.currentRoute.value.params.id = resourceId;
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  test("saves once the debounce elapses", async () => {
    expect.hasAssertions();

    await mountAutosave();
    autosave();
    autosave();
    await elapseDebounce();

    expect(save).toHaveBeenCalledExactlyOnceWith();
  });

  // VueUse's debounce arms a bare setTimeout with no scope cleanup, so an unmounted blade's last keystroke
  // Still fires its save — against whichever resource the app has moved on to
  test("drops the pending save when its scope is disposed", async () => {
    expect.hasAssertions();

    await mountAutosave();
    autosave();
    wrapper.unmount();
    await elapseDebounce();

    expect(save).not.toHaveBeenCalled();
  });

  // Edits that exist only in the tab are the one thing the toolbar must not call saved, and the debounce
  // Re-arms for as long as the owner keeps typing — so a state read from the write alone reports a tab full of
  // Unwritten edits as saved for however long the typing lasts. Clearing it again is `saveContent`'s, since
  // Every door into a save goes through that one, and its own suite is where that half is asserted
  test("reports saving from the keystroke rather than from the write", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    await mountAutosave();
    autosave();
    autosave();

    expect(saveState.value).toBe(ResourceSaveState.Saving);
  });

  // A refused save is an edit that was dropped, not one that landed, so the state it leaves must not be the one
  // Whose tooltip dates the resource's last durable write. The navigation that refused it is what clears the
  // Signal, through the `readResource()` its own page awaits
  test("does not report a save it refuses as saved", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    await mountAutosave();
    autosave();
    router.currentRoute.value.params.id = otherResourceId;
    await elapseDebounce();

    expect(saveState.value).toBe(ResourceSaveState.Saving);
  });

  // The blade is reused across resources, so disposal never runs on this path: the edit was scheduled against
  // One resource and the timer fires while another is loaded, with the store's content ref still holding the
  // Edited one's document
  test("refuses a save scheduled for a resource the app has navigated away from", async () => {
    expect.hasAssertions();

    await mountAutosave();
    autosave();
    router.currentRoute.value.params.id = otherResourceId;
    await elapseDebounce();

    expect(save).not.toHaveBeenCalled();
  });
});
