// @vitest-environment nuxt
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { CacheTag } from "@/models/cache/CacheTag";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useCacheStore } from "@/store/cache";
import { useRecentStore } from "@/store/resource/recent";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useRecentStore, () => {
  const server = setupMswTrpc();
  const resource = createResourceListItem();
  // The object literal `getOffsetPaginationData` returns, not `new OffsetPaginationData(...)`: superjson only
  // Walks plain objects, so an unregistered class instance crosses the wire without type annotations for its
  // Children and every nested `Date` arrives as a string. Matching what the server actually sends keeps the
  // Assertion below able to compare whole rows
  const createReadRecentsHandler = () =>
    vi.fn<() => OffsetPaginationData<ResourceListItem>>(() => ({ hasMore: false, items: [resource] }));

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Home's card and the inline search box mount together and both want the same capped list, so the second
  // Caller joins the request already in flight instead of issuing its own — and a settled read is not re-run
  test("reads the recents once for repeat and concurrent mounts", async () => {
    expect.hasAssertions();

    const handler = createReadRecentsHandler();
    server.use(trpcMsw.resource.readResources.query(handler));
    const recentStore = useRecentStore();
    const { recents } = storeToRefs(recentStore);
    const { readRecents } = recentStore;
    await Promise.all([readRecents(), readRecents()]);
    await readRecents();

    expect(handler).toHaveBeenCalledOnce();
    expect(recents.value).toStrictEqual([resource]);
  });

  // Opening a resource is what the set is ordered by, and a delete or restore changes which of its rows still
  // Resolve — without this the set is read once and Home keeps listing resources that are in the recycle bin.
  // Nothing showing the list is mounted at either moment, so it drops and Home's card re-reads on next mount
  const invalidatingTagCases = [CacheTag.Recents, CacheTag.Resources];
  for (const tag of invalidatingTagCases)
    test(`re-reads the recents on the next mount after ${tag} is invalidated`, async () => {
      expect.hasAssertions();

      const handler = createReadRecentsHandler();
      server.use(trpcMsw.resource.readResources.query(handler));
      const cacheStore = useCacheStore();
      const { invalidateTags } = cacheStore;
      const recentStore = useRecentStore();
      const { readRecents } = recentStore;
      await readRecents();
      await invalidateTags([tag]);
      const callCountAfterInvalidation = handler.mock.calls.length;
      await readRecents();

      expect(callCountAfterInvalidation).toBe(1);
      expect(handler).toHaveBeenCalledTimes(2);
    });

  // A failure must not be cached as "loaded", or the card's Retry would render the same error forever
  test("reissues the read after a failure and clears the error once it lands", async () => {
    expect.hasAssertions();

    let isFailing = true;
    const handler = createReadRecentsHandler();
    server.use(
      trpcMsw.resource.readResources.query(() => {
        if (isFailing) {
          isFailing = false;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        }

        return handler();
      }),
    );
    const recentStore = useRecentStore();
    const { error, recents } = storeToRefs(recentStore);
    const { readRecents } = recentStore;
    await readRecents();

    expect(error.value).toBe("error");
    expect(recents.value).toStrictEqual([]);

    await readRecents();

    expect(error.value).toBe("");
    expect(recents.value).toStrictEqual([resource]);
  });
});
