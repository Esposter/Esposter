import type { VueWrapper } from "@vue/test-utils";

import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useOnlineSubscribable, () => {
  let wrapper: VueWrapper;
  const goOffline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  };
  const goOnline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
  };
  const mountSubscribable = async (source: Ref<string>, callback: (value: string) => (() => void) | void) => {
    wrapper = await mountSuspended(
      defineComponent({ render: () => h("div"), setup: () => useOnlineSubscribable(source, callback) }),
    );
  };

  beforeEach(() => {
    goOnline();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("calls callback when online", async () => {
    expect.hasAssertions();

    const callback = vi.fn();
    const source = ref("");
    await mountSubscribable(source, callback);
    await flushPromises();

    expect(callback).toHaveBeenCalledWith("");
  });

  test("does not call callback when offline", async () => {
    expect.hasAssertions();

    goOffline();
    const callback = vi.fn();
    const source = ref("");
    await mountSubscribable(source, callback);
    await flushPromises();

    expect(callback).not.toHaveBeenCalled();
  });

  test("re-calls callback when source changes while online", async () => {
    expect.hasAssertions();

    const callback = vi.fn();
    const source = ref("");
    await mountSubscribable(source, callback);
    await flushPromises();
    source.value = " ";
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(" ");
  });

  test("calls cleanup when going offline", async () => {
    expect.hasAssertions();

    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const source = ref("");
    await mountSubscribable(source, callback);
    await flushPromises();
    goOffline();
    await flushPromises();

    expect(cleanup).toHaveBeenCalled();
  });

  test("re-establishes callback when coming back online", async () => {
    expect.hasAssertions();

    const callback = vi.fn();
    const source = ref("");
    await mountSubscribable(source, callback);
    await flushPromises();
    goOffline();
    await flushPromises();
    goOnline();
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("calls cleanup on unmount", async () => {
    expect.hasAssertions();

    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const source = ref("");
    await mountSubscribable(source, callback);
    await flushPromises();
    wrapper.unmount();

    expect(cleanup).toHaveBeenCalled();
  });
});
