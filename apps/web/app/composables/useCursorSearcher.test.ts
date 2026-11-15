// @vitest-environment nuxt
import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { Page } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { BACKOFF_BASE_DELAY_MS } from "#shared/services/pagination/constants";
import { createPendingQuery } from "@/composables/data/pagination/createPendingQuery.test";
import { goOnline } from "@/composables/shared/network.test";
import { useCursorSearcher } from "@/composables/useCursorSearcher";
import { AUTO_SEARCH_THROTTLE_MS } from "@/services/shared/constants";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type Item = ToData<AItemEntity>;
type Searcher = ReturnType<typeof useCursorSearcher<Item>>;

const createItem = (): Item => ({ createdAt: new Date(0), id: v7(), updatedAt: new Date(0) });

describe(useCursorSearcher, () => {
  const continuationCursor = "continuationCursor";
  let searcher: Searcher;

  const mountSearcher = async (query: Parameters<typeof useCursorSearcher<Item>>[0]) => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          searcher = useCursorSearcher<Item>(query);
        },
      }),
    );
    await flushPromises();
  };

  beforeEach(() => {
    goOnline();
    // Not `now: 0`, since the throttle compares `Date.now()` against an epoch-zero last run and would read the first
    // Search as inside a window
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // The waypoint re-reads after a failure, and by then the reader may have typed a new search. The continuation of the
  // Page on screen must still be asked of the server for the query that page was read for, with the cursor it answered
  test("asks a continuation retried after a new search for the query its page was read for", async () => {
    expect.hasAssertions();

    const newerItem = createItem();
    const firstItem = createItem();
    const continuedItem = createItem();
    const query = vi
      .fn<(searchQuery: string, cursor: string) => Promise<Page<Item>>>()
      .mockResolvedValueOnce({ items: [firstItem], nextCursor: continuationCursor })
      .mockRejectedValueOnce(new Error(" "))
      .mockResolvedValueOnce({ items: [newerItem], nextCursor: "" })
      .mockResolvedValueOnce({ items: [continuedItem], nextCursor: "" });
    await mountSearcher(query);
    searcher.searchQuery.value = "a";
    await flushPromises();
    await expect(searcher.readMoreSearchedItems(noop)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    // The throttle holds the new search until its window closes, which is the same instant the retry's backoff runs out
    searcher.searchQuery.value = "b";
    await flushPromises();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const retriedRead = searcher.readMoreSearchedItems(noop);
    await flushPromises();

    expect(setTimeoutSpy.mock.lastCall?.[1]).toBe(BACKOFF_BASE_DELAY_MS);

    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_DELAY_MS);
    await retriedRead;

    expect(query).toHaveBeenLastCalledWith("a", continuationCursor);
    expect(searcher.items.value).toStrictEqual([newerItem]);
  });

  // A continuation of the list a newer search replaced lands on that list, and the list on screen is the newer search's
  test("drops a late continuation of a search the reader has since replaced", async () => {
    expect.hasAssertions();

    const firstItem = createItem();
    const newerItem = createItem();
    const lateItem = createItem();
    const { query: lateQuery, resolveQuery } = createPendingQuery<Page<Item>>({ items: [lateItem], nextCursor: "" });
    const query = vi
      .fn<(searchQuery: string, cursor: string) => Promise<Page<Item>>>()
      .mockResolvedValueOnce({ items: [firstItem], nextCursor: continuationCursor })
      .mockImplementationOnce(lateQuery)
      .mockResolvedValueOnce({ items: [newerItem], nextCursor: "" });
    await mountSearcher(query);
    searcher.searchQuery.value = "a";
    await flushPromises();
    const lateContinuation = searcher.readMoreSearchedItems(noop);
    searcher.searchQuery.value = "b";
    await vi.advanceTimersByTimeAsync(AUTO_SEARCH_THROTTLE_MS);
    resolveQuery();
    await lateContinuation;

    expect(searcher.items.value).toStrictEqual([newerItem]);
  });
});
