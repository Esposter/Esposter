// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Resource } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { useReadResources } from "@/composables/resource/useReadResources";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useReadResources, () => {
  const server = setupMswTrpc();
  const items = [{ id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource];
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };

  afterEach(() => {
    vi.useRealTimers();
  });

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

  // An Updated preset resolves its boundary against the current time on every read, so a total keyed by the
  // Resolved filter input would miss its cache on every page turn — the COUNT(*) the keying exists to avoid
  test("counts once for a page change under a relative Updated preset", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const countHandler = vi.fn<() => number>(() => 0);
    server.use(
      trpcMsw.resource.count.query(countHandler),
      trpcMsw.resource.readResources.query(() => ({ hasMore: false, items })),
    );
    const updatedFilter = ref<"" | ResourceUpdatedFilter>(ResourceUpdatedFilter.Last7Days);
    const { readResources } = useReadResources({ updatedFilter });
    await readResources(firstOptions);
    vi.setSystemTime(dayjs(0).add(1, "day").toDate());
    await readResources(secondOptions);

    expect(countHandler).toHaveBeenCalledTimes(1);
  });
});
