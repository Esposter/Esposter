// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "@/store/resource/favorite";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useFavoriteStore, () => {
  const server = setupMswTrpc();
  const resource = { contentVersion: 0, id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource;

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

  test("reads the favorites once for repeat and concurrent mounts", async () => {
    expect.hasAssertions();

    const handler = vi.fn(() => [resource]);
    server.use(trpcMsw.resource.readFavorites.query(handler));
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites } = favoriteStore;
    await Promise.all([readFavorites(), readFavorites()]);
    await readFavorites();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(favorites.value).toStrictEqual([resource]);
  });

  // Joining the read in flight has to hand over its data — Home and the workbench list mount together, and the
  // One that joined would otherwise render an empty favorites list beside a populated one
  test("hands the caller that joined the in-flight read the favorites it asked for", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.resource.readFavorites.query(() => [resource]));
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites } = favoriteStore;
    const inFlightRead = readFavorites();
    await readFavorites();
    const favoritesAfterJoinedRead = [...favorites.value];
    await inFlightRead;

    expect(favoritesAfterJoinedRead).toStrictEqual([resource]);
  });

  // A delete or a restore changes which stars still resolve to a live resource, so the cached set is dropped
  test("re-reads the favorites after an invalidation", async () => {
    expect.hasAssertions();

    const handler = vi.fn(() => [resource]);
    server.use(trpcMsw.resource.readFavorites.query(handler));
    const favoriteStore = useFavoriteStore();
    const { readFavorites, refreshFavorites } = favoriteStore;
    await readFavorites();
    await refreshFavorites();
    await readFavorites();

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
