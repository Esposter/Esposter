import type { VueWrapper } from "@vue/test-utils";
import type { Promisable } from "type-fest";

import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useOnlineSubscribable, () => {
  let wrapper: VueWrapper;
  let source: Ref<string>;
  let callback: ReturnType<typeof vi.fn<(value: string) => Promisable<(() => void) | undefined>>>;
  let cleanup: ReturnType<typeof vi.fn<() => void>>;
  const goOffline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  };
  const goOnline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
  };
  const mountSubscribable = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useOnlineSubscribable(source, callback);
        },
      }),
    );
  };

  beforeEach(() => {
    source = ref("");
    cleanup = vi.fn<() => void>();
    callback = vi.fn<(value: string) => Promisable<(() => void) | undefined>>();
    goOnline();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("calls callback when online", async () => {
    expect.hasAssertions();

    await mountSubscribable();
    await flushPromises();

    expect(callback).toHaveBeenCalledWith("");
  });

  test("does not call callback when offline", async () => {
    expect.hasAssertions();

    goOffline();
    await mountSubscribable();
    await flushPromises();

    expect(callback).not.toHaveBeenCalled();
  });

  test("re-calls callback when source changes while online", async () => {
    expect.hasAssertions();

    await mountSubscribable();
    await flushPromises();
    source.value = " ";
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(" ");
  });

  test("calls cleanup when going offline", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => void) | undefined>>(() => cleanup);
    await mountSubscribable();
    await flushPromises();
    goOffline();
    await flushPromises();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("re-establishes callback when coming back online", async () => {
    expect.hasAssertions();

    await mountSubscribable();
    await flushPromises();
    goOffline();
    await flushPromises();
    goOnline();
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("calls cleanup on unmount", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => void) | undefined>>(() => cleanup);
    await mountSubscribable();
    await flushPromises();
    wrapper.unmount();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("calls cleanup from async callback when going offline", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => void) | undefined>>(() => Promise.resolve(cleanup));
    await mountSubscribable();
    await flushPromises();
    goOffline();
    await flushPromises();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("calls cleanup from async callback on unmount", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => void) | undefined>>(() => Promise.resolve(cleanup));
    await mountSubscribable();
    await flushPromises();
    wrapper.unmount();

    expect(cleanup).toHaveBeenCalledWith();
  });
});
