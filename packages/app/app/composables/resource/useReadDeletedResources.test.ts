// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";

import { useReadDeletedResources } from "@/composables/resource/useReadDeletedResources";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { describe, expect, test, vi } from "vitest";

// Paging, stale-response ordering and error handling belong to useReadResourcesPage and are covered there — the
// Bin's own contribution is that nothing filters it, so its total is counted on the table's first read and
// Reused until a restore or a purge moves it
describe(useReadDeletedResources, () => {
  const server = setupMswTrpc();
  const firstPage = [createResourceListItem()];
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };

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
