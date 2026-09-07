// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { CacheTag } from "@/models/cache/CacheTag";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useCacheStore } from "@/store/cache";
import { useFavoriteStore } from "@/store/resource/favorite";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useFavoriteStore, () => {
  const server = setupMswTrpc();
  const resource = createResourceListItem();
  const otherResource = createResourceListItem();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Two tabs on the same list: the second still holds the pre-star rows, so its optimistic flip stars the row
  // While the server's delete-then-insert finds the star the first tab set, removes it and answers false
  test("takes the server's post-toggle state over an optimistic flip that starred", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.resource.toggleFavorite.mutation(() => false));
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { toggleFavorite } = favoriteStore;
    await toggleFavorite(resource);

    expect(favorites.value).toStrictEqual([]);
  });

  test("takes the server's post-toggle state over an optimistic flip that unstarred", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.resource.readFavorites.query(() => [resource]),
      trpcMsw.resource.toggleFavorite.mutation(() => true),
    );
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites, toggleFavorite } = favoriteStore;
    await readFavorites();
    await toggleFavorite(resource);

    expect(favorites.value).toStrictEqual([resource]);
  });

  // Two quick clicks on one star queue under the same key, so the second one's rollback has to undo its own
  // Flip rather than the state at click time — nothing reconciles a dropped star until a reload
  test("rolls a failed toggle back to the state the toggle ahead of it stored", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.resource.toggleFavorite.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        isFailing = true;
        return true;
      }),
    );
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { toggleFavorite } = favoriteStore;
    await Promise.all([toggleFavorite(resource), toggleFavorite(resource)]);

    expect(favorites.value).toStrictEqual([resource]);
  });

  // This list is replaced wholesale by its own cached read, which refetches the moment a delete elsewhere
  // Invalidates the resources tag — so anything that read delivered is not re-read until a reload
  test("rolls a failed toggle back without dropping stars a re-read delivered", async () => {
    expect.hasAssertions();

    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    let isRead = false;
    server.use(
      trpcMsw.resource.readFavorites.query(() => {
        if (isRead) return [otherResource];

        isRead = true;
        return [];
      }),
      trpcMsw.resource.toggleFavorite.mutation(async () => {
        // The re-read lands while the toggle is still in flight
        await invalidateTags([CacheTag.Resources]);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites, toggleFavorite } = favoriteStore;
    await readFavorites();
    await toggleFavorite(resource);

    expect(favorites.value).toStrictEqual([otherResource]);
  });

  test("reads the favorites once for repeat and concurrent mounts", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ResourceListItem[]>(() => [resource]);
    server.use(trpcMsw.resource.readFavorites.query(handler));
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites } = favoriteStore;
    await Promise.all([readFavorites(), readFavorites()]);
    await readFavorites();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(favorites.value).toStrictEqual([resource]);
  });

  // A delete or a restore changes which stars still resolve to a live resource, and the stars are rendered in
  // The very table the delete is issued from — so this is the one cache that re-reads at once rather than
  // Dropping and waiting for its next mount
  test("re-reads the favorites the moment the resources tag is invalidated", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ResourceListItem[]>(() => [resource]);
    server.use(trpcMsw.resource.readFavorites.query(handler));
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    const favoriteStore = useFavoriteStore();
    const { readFavorites } = favoriteStore;
    await readFavorites();
    await invalidateTags([CacheTag.Resources]);
    const callCountAfterInvalidation = handler.mock.calls.length;
    await readFavorites();

    expect(callCountAfterInvalidation).toBe(2);
    // The re-read re-cached the set, so the next mount reads nothing
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
