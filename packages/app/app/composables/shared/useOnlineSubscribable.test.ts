// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { VueWrapper } from "@vue/test-utils";
import type { Promisable } from "type-fest";

import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useOnlineSubscribable, () => {
  let wrapper: VueWrapper;
  let source: Ref<string>;
  let callback: ReturnType<typeof vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>>;
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
    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>();
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

    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() => cleanup);
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

    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() => cleanup);
    await mountSubscribable();
    await flushPromises();
    wrapper.unmount();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("calls cleanup from async callback when going offline", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() =>
      Promise.resolve(cleanup),
    );
    await mountSubscribable();
    await flushPromises();
    goOffline();
    await flushPromises();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("calls cleanup from async callback on unmount", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() =>
      Promise.resolve(cleanup),
    );
    await mountSubscribable();
    await flushPromises();
    wrapper.unmount();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("awaits async cleanup before re-calling callback on source change", async () => {
    expect.hasAssertions();

    const { promise, resolve: resolveCleanup } = Promise.withResolvers<void>();
    const asyncCleanup = vi.fn<() => Promise<void>>(() => promise);
    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() => asyncCleanup);
    await mountSubscribable();
    await flushPromises();

    source.value = " ";
    await flushPromises();

    expect(asyncCleanup).toHaveBeenCalledWith();
    expect(callback).toHaveBeenCalledTimes(1);

    resolveCleanup();
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(" ");
  });

  test("calls callback when called after an async operation with pre-captured context", async () => {
    expect.hasAssertions();

    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: async () => {
          const context = { instance: getCurrentInstance(), scope: getCurrentScope() };
          await Promise.resolve();
          useOnlineSubscribable(source, callback, context);
        },
      }),
    );
    await flushPromises();

    expect(callback).toHaveBeenCalledWith("");
  });

  test("calls cleanup on unmount when called after an async operation with pre-captured context", async () => {
    expect.hasAssertions();

    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() => cleanup);
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: async () => {
          const context = { instance: getCurrentInstance(), scope: getCurrentScope() };
          await Promise.resolve();
          useOnlineSubscribable(source, callback, context);
        },
      }),
    );
    await flushPromises();
    wrapper.unmount();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("awaits async cleanup before re-establishing callback when coming back online", async () => {
    expect.hasAssertions();

    const { promise, resolve: resolveCleanup } = Promise.withResolvers<void>();
    const asyncCleanup = vi.fn<() => Promise<void>>(() => promise);
    callback = vi.fn<(value: string) => Promisable<(() => Promisable<void>) | undefined>>(() => asyncCleanup);
    await mountSubscribable();
    await flushPromises();

    goOffline();
    await flushPromises();
    goOnline();
    await flushPromises();

    expect(asyncCleanup).toHaveBeenCalledWith();
    expect(callback).toHaveBeenCalledTimes(1);

    resolveCleanup();
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
