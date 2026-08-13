// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { BACKOFF_BASE_DELAY_MS } from "#shared/services/pagination/constants";
import { goOffline, goOnline } from "@/composables/shared/network.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useCursorPaginationOperationData, () => {
  let wrapper: VueWrapper;
  let readMoreItems: ReturnType<typeof useCursorPaginationOperationData<string>>["readMoreItems"];

  beforeEach(() => {
    goOnline();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("does not query more items while offline and still completes the waypoint cycle", async () => {
    expect.hasAssertions();

    goOffline();
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          const cursorPaginationData = ref(new CursorPaginationData<string>());
          cursorPaginationData.value.hasMore = true;
          cursorPaginationData.value.nextCursor = "cursor";
          const isLoaded = ref(false);
          ({ readMoreItems } = useCursorPaginationOperationData(
            () => cursorPaginationData,
            () => isLoaded,
          ));
        },
      }),
    );
    await flushPromises();

    const query = vi.fn<(cursor?: string) => Promise<CursorPaginationData<string>>>();
    const onComplete = vi.fn<() => void>();

    await readMoreItems(query, onComplete);

    expect(query).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test("paces retries with exponential backoff after a failing query", async () => {
    expect.hasAssertions();

    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          const cursorPaginationData = ref(new CursorPaginationData<string>());
          cursorPaginationData.value.hasMore = true;
          cursorPaginationData.value.nextCursor = "cursor";
          const isLoaded = ref(false);
          ({ readMoreItems } = useCursorPaginationOperationData(
            () => cursorPaginationData,
            () => isLoaded,
          ));
        },
      }),
    );
    await flushPromises();

    // Fire timers immediately so the retry pacing is observable without waiting out the real delay
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout").mockImplementation((callback) => {
      callback();
      return 0 as never;
    });
    const error = new Error("error");
    const query = vi.fn<(cursor?: string) => Promise<CursorPaginationData<string>>>(() => Promise.reject(error));
    const onComplete = vi.fn<() => void>();

    await expect(readMoreItems(query, onComplete)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: ${error.message}]`,
    );

    expect(query).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).not.toHaveBeenCalled();

    await expect(readMoreItems(query, onComplete)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: ${error.message}]`,
    );

    expect(setTimeoutSpy.mock.lastCall?.[1]).toBe(BACKOFF_BASE_DELAY_MS);
    expect(query).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
