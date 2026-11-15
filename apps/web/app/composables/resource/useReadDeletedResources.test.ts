// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { PageCursor } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useReadDeletedResources } from "@/composables/resource/useReadDeletedResources";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { encodePageCursor, START_PAGE_CURSOR } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// Paging, stale-response ordering and error handling belong to useReadResourcesPage and are covered there — the
// Bin's own contribution is that nothing filters it, so its total is counted on the table's first read and
// Reused until a restore or a purge moves it
describe(useReadDeletedResources, () => {
  const { trpcMsw } = setupMswTrpc();
  const nextPageCursor: PageCursor = { isBackward: false, values: [0, v7()] };
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };

  test("counts the bin on its first page, and reads a page change without counting again", async () => {
    expect.hasAssertions();

    const sentCursors: unknown[] = [];
    trpcMsw.resource.readDeletedResources.query(({ input }) => {
      sentCursors.push(input?.cursor);
      return sentCursors.length === 1
        ? { count: 2, items: [createResourceListItem()], nextCursor: encodePageCursor(nextPageCursor) }
        : { items: [createResourceListItem()], nextCursor: "" };
    });
    const { readDeletedResources } = useReadDeletedResources();
    await readDeletedResources(firstOptions);
    await readDeletedResources(secondOptions);

    expect(sentCursors).toStrictEqual([START_PAGE_CURSOR, nextPageCursor]);
  });
});
