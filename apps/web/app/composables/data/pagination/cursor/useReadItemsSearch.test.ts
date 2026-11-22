import { useReadItemsSearch } from "#src/composables/data/pagination/cursor/useReadItemsSearch";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe(useReadItemsSearch, () => {
  test("reports a failed read as an error, and retry reads it again", async () => {
    expect.hasAssertions();

    const searchQuery = ref("");
    const isReadError = ref(true);
    const readItemsSearch = vi.fn<(newSearchQuery: string, signal?: AbortSignal) => Promise<{ isError: Ref<boolean> }>>(
      () => Promise.resolve({ isError: isReadError }),
    );
    const { isError, retry } = useReadItemsSearch(searchQuery, readItemsSearch);
    await flushPromises();
    expect(isError.value).toBe(true);

    isReadError.value = false;
    await retry();
    expect(isError.value).toBe(false);
    expect(readItemsSearch).toHaveBeenCalledTimes(2);
  });
});
