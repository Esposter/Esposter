// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "@/store/resource/favorite";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useFavoriteStore, () => {
  const server = setupMswTrpc();
  const resource = createResourceListItem({ contentVersion: 0 });

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
  // Flip — restoring the list from click time would drop the star the first click just persisted, and nothing
  // Reconciles that until a reload
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

  // A delete or a restore changes which stars still resolve to a live resource, so the cached set is dropped
  test("re-reads the favorites after an invalidation", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ResourceListItem[]>(() => [resource]);
    server.use(trpcMsw.resource.readFavorites.query(handler));
    const favoriteStore = useFavoriteStore();
    const { readFavorites, refreshFavorites } = favoriteStore;
    await readFavorites();
    await refreshFavorites();
    await readFavorites();

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
