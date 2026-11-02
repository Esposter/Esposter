import type { createErrorAlert } from "@/services/trpc/createErrorAlert";

import { useAutoSearch } from "@/composables/useAutoSearch";
import { AUTO_SEARCH_THROTTLE_MS } from "@/services/shared/constants";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/trpc/createErrorAlert"), () => ({ createErrorAlert: vi.fn<typeof createErrorAlert>() }));

const setupAutoSearch = () => {
  const searchQuery = ref("");
  const searchedQueries: string[] = [];
  const reset = vi.fn<() => void>();
  useAutoSearch(searchQuery, {
    reset,
    search: (newSearchQuery) => {
      searchedQueries.push(newSearchQuery);
      return Promise.resolve();
    },
  });
  return { reset, searchedQueries, searchQuery };
};

describe(useAutoSearch, () => {
  const searchQueryValue = "a";

  beforeEach(() => {
    // Not `now: 0` — the throttle compares `Date.now()` against an epoch-zero "last run", so a clock parked at 0
    // Reads the very first call as one already inside a window and defers it to the trailing edge
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("searches the query that was typed", async () => {
    expect.hasAssertions();

    const { searchedQueries, searchQuery } = setupAutoSearch();
    searchQuery.value = searchQueryValue;
    await flushPromises();

    expect(searchedQueries).toStrictEqual([searchQueryValue]);
  });

  // Emptying the box discards the results it produced, so the same string typed again is a new search. Throttling
  // A copy of the query instead of the call would leave that copy holding the string it already held, its watcher
  // Would never fire, and the group would stay permanently empty
  test("searches again when the query is cleared and retyped inside one throttle window", async () => {
    expect.hasAssertions();

    const { reset, searchedQueries, searchQuery } = setupAutoSearch();
    searchQuery.value = searchQueryValue;
    await flushPromises();
    searchQuery.value = "";
    await flushPromises();

    expect(reset).toHaveBeenCalledExactlyOnceWith();

    searchQuery.value = searchQueryValue;
    await flushPromises();
    await vi.advanceTimersByTimeAsync(AUTO_SEARCH_THROTTLE_MS);

    expect(searchedQueries).toStrictEqual([searchQueryValue, searchQueryValue]);
  });

  // The trailing edge carries whatever the box holds when it fires, and an emptied box has already been reset
  test("does not search an emptied query on the trailing edge", async () => {
    expect.hasAssertions();

    const { searchedQueries, searchQuery } = setupAutoSearch();
    searchQuery.value = searchQueryValue;
    await flushPromises();
    searchQuery.value = "";
    await flushPromises();
    await vi.advanceTimersByTimeAsync(AUTO_SEARCH_THROTTLE_MS);

    expect(searchedQueries).toStrictEqual([searchQueryValue]);
  });

  // A failure is about the query the screen showed, and emptying the box is what discards that query's results
  test("clears a failed search's error when the box is emptied", async () => {
    expect.hasAssertions();

    const searchQuery = ref("");
    const { isError } = useAutoSearch(searchQuery, { reset: noop, search: () => Promise.reject(new Error(" ")) });
    searchQuery.value = searchQueryValue;
    await flushPromises();
    expect(isError.value).toBe(true);

    searchQuery.value = "";
    await flushPromises();

    expect(isError.value).toBe(false);
  });
});
