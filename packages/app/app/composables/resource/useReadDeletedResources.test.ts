// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";

import { useReadDeletedResources } from "@/composables/resource/useReadDeletedResources";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { describe, expect, test, vi } from "vitest";

describe(useReadDeletedResources, () => {
  const server = setupMswTrpc();
  const firstPage = [createResourceListItem()];
  const secondPage = [createResourceListItem()];
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };

  // Page the bin quickly, or hit Refresh while a page read is in flight, and the slower earlier response lands
  // Last: the table would show page 1's rows while the pager reads page 2, and a purge issued from that stale
  // Row permanently destroys a resource the user never picked
  test("drops a stale response instead of overwriting fresher rows", async () => {
    expect.hasAssertions();

    let resolveFirstPage: (() => void) | undefined;
    server.use(
      trpcMsw.resource.countDeletedResources.query(() => 0),
      trpcMsw.resource.readDeletedResources.query(async ({ input }) => {
        if (input?.offset === 0)
          await new Promise<void>((resolve) => {
            resolveFirstPage = resolve;
          });
        return { hasMore: false, items: input?.offset === 0 ? firstPage : secondPage };
      }),
    );
    const { isLoading, items, readDeletedResources } = useReadDeletedResources();
    const firstRead = readDeletedResources(firstOptions);
    await readDeletedResources(secondOptions);
    resolveFirstPage?.();
    await firstRead;

    expect(items.value).toStrictEqual(secondPage);
    expect(isLoading.value).toBe(false);
  });

  test("counts once for a page change and re-counts on a refresh", async () => {
    expect.hasAssertions();

    const countHandler = vi.fn<() => number>(() => 0);
    server.use(
      trpcMsw.resource.countDeletedResources.query(countHandler),
      trpcMsw.resource.readDeletedResources.query(() => ({ hasMore: false, items: firstPage })),
    );
    const { readDeletedResources, refresh } = useReadDeletedResources();
    await readDeletedResources(firstOptions);
    await readDeletedResources(secondOptions);

    expect(countHandler).toHaveBeenCalledTimes(1);

    await refresh();

    expect(countHandler).toHaveBeenCalledTimes(2);
  });
});
