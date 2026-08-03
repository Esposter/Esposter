// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Resource } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { useReadResources } from "@/composables/resource/useReadResources";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

describe(useReadResources, () => {
  const server = setupMswTrpc();
  const items = [{ id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource];
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };

  // Vuetify fires @update:options for a page turn, a page-size change and a sort change as well as a filter
  // Change, and none of the first three move a total that for a search is a COUNT(*) behind a trigram predicate
  test("counts once for a page or sort change and re-counts when the filter changes", async () => {
    expect.hasAssertions();

    const countHandler = vi.fn<() => number>(() => 0);
    server.use(
      trpcMsw.resource.count.query(countHandler),
      trpcMsw.resource.readResources.query(() => ({ hasMore: false, items })),
    );
    const searchQuery = ref("");
    const { readResources } = useReadResources({ searchQuery });
    await readResources(firstOptions);
    await readResources(secondOptions);
    await readResources({ ...secondOptions, sortBy: [{ key: "name", order: SortOrder.Asc }] });

    expect(countHandler).toHaveBeenCalledTimes(1);

    searchQuery.value = " ";
    await readResources(firstOptions);

    expect(countHandler).toHaveBeenCalledTimes(2);
  });
});
