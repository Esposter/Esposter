// @vitest-environment nuxt
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { PageCursor } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useReadResources } from "@/composables/resource/useReadResources";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { encodePageCursor, START_PAGE_CURSOR } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useReadResources, () => {
  const { trpcMsw } = setupMswTrpc();
  const items = [createResourceListItem()];
  const nextPageCursor: PageCursor = { isBackward: false, values: [0, v7()] };
  const firstOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 1, sortBy: [] };
  const secondOptions: ReadResourcesOptions = { itemsPerPage: 1, page: 2, sortBy: [] };
  // The first page answers the total, and the page after it is read from the cursor the first one named. Each read's
  // Cursor, as the server parsed it, is kept in the order the reads came
  const recordReads = (sentCursors: unknown[]) => {
    trpcMsw.resource.readResources.query(({ input }) => {
      sentCursors.push(input?.cursor);
      return sentCursors.length === 1
        ? { count: 1, items, nextCursor: encodePageCursor(nextPageCursor) }
        : { items, nextCursor: "" };
    });
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  // An Updated preset resolves its boundary against the current time on every read. The page after the first one is
  // Read from its cursor and not the first page again, so the boundary moving does not re-read the total
  test("reads a page under a relative Updated preset without re-reading the first page", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date", "Temporal"] });
    const sentCursors: unknown[] = [];
    recordReads(sentCursors);
    const updatedFilter = ref<"" | ResourceUpdatedFilter>(ResourceUpdatedFilter.Last7Days);
    const { readResources } = useReadResources({ updatedFilter });
    await readResources(firstOptions);
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").add({ days: 1 }));
    await readResources(secondOptions);

    expect(sentCursors).toStrictEqual([START_PAGE_CURSOR, nextPageCursor]);
  });

  test("reads the first page again when the search changes", async () => {
    expect.hasAssertions();

    const sentCursors: unknown[] = [];
    recordReads(sentCursors);
    const searchQuery = ref("");
    const { count, readResources } = useReadResources({ searchQuery });
    await readResources(firstOptions);
    sentCursors.length = 0;
    searchQuery.value = "budget";
    await readResources(firstOptions);

    expect(sentCursors).toStrictEqual([START_PAGE_CURSOR]);
    expect(count.value).toBe(1);
  });
});
