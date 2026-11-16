// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useRestoreResources } from "#src/composables/resource/useRestoreResources";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";

describe(useRestoreResources, () => {
  const { trpcMsw } = setupMswTrpc();

  // The ids go out chunk-by-chunk and each chunk commits independently, so a later chunk's failure still leaves the
  // Earlier ones restored server-side — the one write that has to invalidate even though it reports as failed, as the
  // Delete it undoes does. The favorite set is read once per session, so nothing else would re-read it
  test("invalidates the resources tag when a restore fails after an earlier chunk committed", async () => {
    expect.hasAssertions();

    const readFavorites = vi.fn<() => ResourceListItem[]>(() => []);
    let chunkCount = 0;
    // The restored rows the server answers with, one per id the chunk restored
    trpcMsw.resource.restoreResources.mutation(({ input: { ids } }) => {
      chunkCount += 1;
      if (chunkCount > 1) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return ids.map((id) => createResourceListItem({ id }));
    });
    trpcMsw.resource.readFavorites.query(readFavorites);
    // The favorites cache is loaded by the time a restore runs, so the invalidation has something to re-read
    const favoriteStore = useFavoriteStore();
    const { readFavorites: readCachedFavorites } = favoriteStore;
    await readCachedFavorites();
    const { promise: isRefreshed, resolve: onRefreshed } = Promise.withResolvers<void>();
    const refresh = vi.fn<() => Promise<void>>(() => {
      onRefreshed();
      return Promise.resolve();
    });
    const resources = Array.from({ length: MAX_READ_LIMIT + 1 }, () => createResourceListItem());
    useRestoreResources(refresh).restoreResources(resources);

    // The refresh is the error path's last step, and it runs after the invalidation has re-read the favorites
    await isRefreshed;
    expect(readFavorites).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });
});
