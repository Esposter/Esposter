// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { RouterView } from "vue-router";

const elapseDebounce = async () => {
  vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
  await waitForSynchronizedFunctions();
};

describe(useAutosaveFunction, () => {
  let router: Router;
  let wrapper: VueWrapper;
  let save: ReturnType<typeof vi.fn<() => Promise<void>>>;
  let autosave: () => void;
  const autosaveHost = defineComponent({
    render: () => h("div"),
    setup: () => {
      autosave = useAutosaveFunction(save);
    },
  });
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
  const mountAutosave = async () => {
    wrapper = await mountSuspended(autosaveHost);
    // Mounting resets the route, so the resource the edit is made on is named once the blade is up
    Object.assign(router.currentRoute.value.params, { id: resourceId });
    vi.useFakeTimers({ now: 0 });
  };

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    save = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    // The indicator reads the resource on screen, so an edit is only ever held for a loaded one
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem({ id: resourceId, type: ResourceType.Sheet });
  });

  afterEach(() => {
    vi.useRealTimers();
    const resourceStore = useResourceStore();
    resourceStore.clearResource(resourceId);
  });

  test("saves once the debounce elapses", async () => {
    expect.hasAssertions();

    await mountAutosave();
    autosave();
    autosave();
    await elapseDebounce();

    expect(save).toHaveBeenCalledExactlyOnceWith();
  });

  // A blade closed while its resource stays open writes the edit it still holds, rather than leaving it to a debounce
  // That went with the blade's scope
  test("writes the held edit when its scope is disposed on the resource still open", async () => {
    expect.hasAssertions();

    await mountAutosave();
    autosave();
    wrapper.unmount();
    await waitForSynchronizedFunctions();

    expect(save).toHaveBeenCalledExactlyOnceWith();
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
    Object.assign(router.currentRoute.value.params, { id: otherResourceId });
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
    Object.assign(router.currentRoute.value.params, { id: otherResourceId });
    await elapseDebounce();

    expect(save).not.toHaveBeenCalled();
  });

  // Navigating away runs the leave guard before the route changes, so the held edit is written while the route still
  // Names its resource, and the write lands against that resource rather than the one navigated to
  test("writes the held edit before navigating away from its resource", async () => {
    expect.hasAssertions();

    const hostPath = `/autosave-host/${resourceId}`;
    const elsewherePath = "/autosave-elsewhere";
    let pathAtSave: string | undefined;
    save.mockImplementation(() => {
      pathAtSave = router.currentRoute.value.path;
      return Promise.resolve();
    });
    router.addRoute({ component: autosaveHost, path: "/autosave-host/:id" });
    router.addRoute({ component: defineComponent({ render: () => h("div") }), path: elsewherePath });
    await mountSuspended(defineComponent({ render: () => h(RouterView) }), { route: hostPath });
    autosave();
    await navigateTo(elsewherePath, { replace: true });

    expect(save).toHaveBeenCalledExactlyOnceWith();
    expect(pathAtSave).toBe(hostPath);
    expect(router.currentRoute.value.path).toBe(elsewherePath);
  });

  // A change of id within the same route is no leave, so only the navigation guard sees it, and the edit is still
  // Written against the resource it was made on
  test("writes the held edit before changing the resource id within the same route", async () => {
    expect.hasAssertions();

    const hostPath = `/autosave-host/${resourceId}`;
    let pathAtSave: string | undefined;
    save.mockImplementation(() => {
      pathAtSave = router.currentRoute.value.path;
      return Promise.resolve();
    });
    router.addRoute({ component: autosaveHost, path: "/autosave-host/:id" });
    await mountSuspended(defineComponent({ render: () => h(RouterView) }), { route: hostPath });
    autosave();
    await navigateTo(`/autosave-host/${otherResourceId}`, { replace: true });

    expect(save).toHaveBeenCalledExactlyOnceWith();
    expect(pathAtSave).toBe(hostPath);
  });

  // The owner keeps typing while the leaving write is in flight, so the edit made meanwhile is still held for the route
  // The guard runs on, and it is written before the route changes rather than dropped with the blade's scope
  test("writes an edit made while the leaving write is in flight", async () => {
    expect.hasAssertions();

    const hostPath = `/autosave-host/${resourceId}`;
    let isTyping = true;
    save.mockImplementation(() => {
      if (isTyping) {
        isTyping = false;
        autosave();
      }
      return Promise.resolve();
    });
    router.addRoute({ component: autosaveHost, path: "/autosave-host/:id" });
    await mountSuspended(defineComponent({ render: () => h(RouterView) }), { route: hostPath });
    autosave();
    await navigateTo(`/autosave-host/${otherResourceId}`, { replace: true });

    expect(save).toHaveBeenCalledTimes(2);
  });
});
