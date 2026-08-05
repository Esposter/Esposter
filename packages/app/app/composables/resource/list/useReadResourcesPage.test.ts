// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Resource } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { useReadResourcesPage } from "@/composables/resource/list/useReadResourcesPage";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

const createOptions = (
  readCount: () => Promise<number>,
  readPage: (options: ReadResourcesOptions) => Promise<Resource[]>,
  getFilterKey: () => string = () => "",
) => ({ getFilterInput: () => undefined, getFilterKey, readCount, readPage });

describe(useReadResourcesPage, () => {
  const firstPage = [{ id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource];
  const secondPage = [{ id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource];
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };

  // The recycle bin pages quickly, or a Refresh lands while a page read is in flight: the slower earlier
  // Response arriving last would leave the table showing page 1 while the pager reads page 2, and a purge
  // Issued from that row destroys a resource the user never picked
  test("drops a stale response instead of overwriting fresher rows", async () => {
    expect.hasAssertions();

    let resolveFirstPage: ((resources: Resource[]) => void) | undefined;
    const { isLoading, items, read } = useReadResourcesPage(
      createOptions(
        () => Promise.resolve(0),
        ({ page }) =>
          page === firstOptions.page
            ? new Promise<Resource[]>((resolve) => {
                resolveFirstPage = resolve;
              })
            : Promise.resolve(secondPage),
      ),
    );
    const firstRead = read(firstOptions);
    await read(secondOptions);
    resolveFirstPage?.(firstPage);
    await firstRead;

    expect(items.value).toStrictEqual(secondPage);
    expect(isLoading.value).toBe(false);
  });

  test("counts once for a page or sort change and re-counts when the filter changes", async () => {
    expect.hasAssertions();

    const readCount = vi.fn<() => Promise<number>>(() => Promise.resolve(0));
    const filterKey = ref("");
    const { read } = useReadResourcesPage(
      createOptions(
        readCount,
        () => Promise.resolve(firstPage),
        () => filterKey.value,
      ),
    );
    await read(firstOptions);
    await read(secondOptions);
    await read({ ...secondOptions, sortBy: [{ key: "name", order: SortOrder.Asc }] });

    expect(readCount).toHaveBeenCalledTimes(1);

    filterKey.value = " ";
    await read(firstOptions);

    expect(readCount).toHaveBeenCalledTimes(2);
  });

  // A relative Updated preset anchors its boundary to the current time, so resolving the filter once per query
  // Would count over a window the page never read
  test("hands one resolved filter input to both queries", async () => {
    expect.hasAssertions();

    let resolveCount = 0;
    const readCount = vi.fn<(filterInput: number) => Promise<number>>(() => Promise.resolve(0));
    const readPage = vi.fn<(options: ReadResourcesOptions, filterInput: number) => Promise<Resource[]>>(() =>
      Promise.resolve(firstPage),
    );
    const { read } = useReadResourcesPage({
      getFilterInput: () => resolveCount++,
      getFilterKey: () => "",
      readCount,
      readPage,
    });
    await read(firstOptions);

    expect(readCount).toHaveBeenCalledWith(0);
    expect(readPage).toHaveBeenCalledWith(firstOptions, 0);
  });

  // A delete, restore or purge moves the total behind an unchanged filter
  test("re-counts on a refresh", async () => {
    expect.hasAssertions();

    const readCount = vi.fn<() => Promise<number>>(() => Promise.resolve(0));
    const { read, refresh } = useReadResourcesPage(createOptions(readCount, () => Promise.resolve(firstPage)));
    await read(firstOptions);
    await refresh();

    expect(readCount).toHaveBeenCalledTimes(2);
  });

  test("clears the rows and re-counts after a failed read", async () => {
    expect.hasAssertions();

    const message = "message";
    const readCount = vi.fn<() => Promise<number>>(() => Promise.resolve(1));
    let isFailing = true;
    const { count, error, items, read } = useReadResourcesPage(
      createOptions(readCount, () => {
        if (isFailing) return Promise.reject(new Error(message));
        return Promise.resolve(firstPage);
      }),
    );
    await read(firstOptions);

    expect(items.value).toStrictEqual([]);
    expect(count.value).toBe(0);
    expect(error.value).toBe(message);

    isFailing = false;
    await read(firstOptions);

    expect(items.value).toStrictEqual(firstPage);
    expect(count.value).toBe(1);
    expect(readCount).toHaveBeenCalledTimes(2);
  });
});
