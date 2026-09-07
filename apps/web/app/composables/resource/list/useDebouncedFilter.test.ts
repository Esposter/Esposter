// @vitest-environment nuxt
import { useDebouncedFilter } from "@/composables/resource/list/useDebouncedFilter";
import { RESOURCE_SEARCH_DEBOUNCE_MS } from "@/services/resource/search/constants";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useDebouncedFilter, () => {
  const value = " ";

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Every filter field is part of the data table's `search` prop, so a per-keystroke write resets the table to
  // Page 1 and re-runs both the count and the page query on every character
  test("holds the filter until typing settles", async () => {
    expect.hasAssertions();

    const filter = ref("");
    const { editedFilter } = useDebouncedFilter(filter);
    editedFilter.value = value;
    await nextTick();

    expect(filter.value).toBe("");

    vi.advanceTimersByTime(RESOURCE_SEARCH_DEBOUNCE_MS);
    await nextTick();

    expect(filter.value).toBe(value);
  });

  // Back navigation and Clear filters write the filter, and the field has to follow
  test("follows the filter back into the field", async () => {
    expect.hasAssertions();

    const filter = ref("");
    const { editedFilter } = useDebouncedFilter(filter);
    filter.value = value;
    await nextTick();

    expect(editedFilter.value).toBe(value);
  });
});
