// @vitest-environment nuxt
import type { ResourceFavoriteListItem } from "#shared/models/resource/ResourceFavoriteListItem";

import { createResourceFavoriteListItem } from "#shared/services/resource/list/createResourceFavoriteListItem.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { CacheTag } from "#src/models/cache/CacheTag";
import { setupSession } from "#src/services/auth/setupSession.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCacheStore } from "#src/store/cache";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { encodePageCursor } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The one page a read answers when the set fits on it, which the store reads to its end
const favoritePage = (items: ResourceFavoriteListItem[]) => ({ items, nextCursor: "" });

describe(useFavoriteStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUserId = v7();
  setupSession(appUserId);
  const resource = createResourceListItem();
  const otherResource = createResourceListItem();
  // The clock starts at the epoch, so a removal dated the epoch is still inside the tombstone retention
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  // A star a removal left as a tombstone: the read still joins its resource, so a star set again shows it at once
  const createRemovedStar = (starred: typeof resource) =>
    createResourceFavoriteListItem(starred, { deletedAt: new Date(0), userId: appUserId });
  // The row the server answers a set or removed star with, at the version it was written at
  const createStarRow = (starred: typeof resource, deletedAt: Date | null) => ({
    createdAt: new Date(0),
    deletedAt,
    resourceId: starred.id,
    updatedAt: new Date(0),
    userId: appUserId,
    version: 1,
  });

  // A star is set on screen before the server answers, and the answer that comes back as a tombstone takes over
  test("takes the server's answer over an optimistic star that it removed", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readFavorites.query(() =>
      favoritePage([createResourceFavoriteListItem(resource, { userId: appUserId })]),
    );
    trpcMsw.resource.toggleFavorite.mutation(() => createStarRow(resource, new Date()));
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites, toggleFavorite } = favoriteStore;
    await readFavorites();
    toggleFavorite(resource);
    await flushPromises();

    expect(favorites.value).toStrictEqual([]);
  });

  // A star set on screen shows its resource, which the read joined to the tombstone it left behind
  test("shows a star set on screen with the resource the read joined to it", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readFavorites.query(() => favoritePage([createRemovedStar(resource)]));
    trpcMsw.resource.toggleFavorite.mutation(() => createStarRow(resource, null));
    const favoriteStore = useFavoriteStore();
    const { favoriteIds, favorites } = storeToRefs(favoriteStore);
    const { readFavorites, toggleFavorite } = favoriteStore;
    await readFavorites();
    toggleFavorite(resource);

    expect(favoriteIds.value.has(resource.id)).toBe(true);

    await flushPromises();

    expect(favorites.value).toStrictEqual([resource]);
  });

  // Two quick clicks on one star queue on the same row: the second click removes what the first set, and when it is
  // Refused the row is the one the first click's answer holds, so the star stays set
  test("keeps the star the first of two quick toggles set when the second is refused", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readFavorites.query(() => favoritePage([createRemovedStar(resource)]));
    let isFirstToggle = true;
    trpcMsw.resource.toggleFavorite.mutation(() => {
      if (!isFirstToggle) throw trpcError;

      isFirstToggle = false;
      return createStarRow(resource, null);
    });
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites, toggleFavorite } = favoriteStore;
    await readFavorites();
    toggleFavorite(resource);
    toggleFavorite(resource);
    await flushPromises();

    expect(favorites.value).toStrictEqual([resource]);
  });

  // This list is replaced by its own cached read, which refetches the moment a delete elsewhere invalidates the
  // Resources tag. A star that re-read delivers while a toggle is in flight is kept when that toggle is refused
  test("keeps the stars a re-read delivered while a refused toggle was in flight", async () => {
    expect.hasAssertions();

    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    let isRead = false;
    trpcMsw.resource.readFavorites.query(() => {
      if (isRead) return favoritePage([createResourceFavoriteListItem(otherResource, { userId: appUserId })]);

      isRead = true;
      return favoritePage([]);
    });
    trpcMsw.resource.toggleFavorite.mutation(async () => {
      // The re-read lands while the toggle is still in flight
      await invalidateTags([CacheTag.Resources]);
      throw trpcError;
    });
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites, toggleFavorite } = favoriteStore;
    await readFavorites();
    toggleFavorite(resource);
    await flushPromises();

    expect(favorites.value).toStrictEqual([otherResource]);
  });

  test("reads the favorites once for repeat and concurrent mounts", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ResourceFavoriteListItem[]>(() => [createResourceFavoriteListItem(resource)]);
    trpcMsw.resource.readFavorites.query(() => favoritePage(handler()));
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites } = favoriteStore;
    await Promise.all([readFavorites(), readFavorites()]);
    await readFavorites();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(favorites.value).toStrictEqual([resource]);
  });

  // Every row's star state needs the whole set, so a star on a later page of it is starred too
  test("holds the stars of every page of the set", async () => {
    expect.hasAssertions();

    const laterResource = createResourceListItem();
    let isFirstPage = true;
    trpcMsw.resource.readFavorites.query(() => {
      const page = isFirstPage
        ? {
            items: [createResourceFavoriteListItem(resource, { userId: appUserId })],
            nextCursor: encodePageCursor({ isBackward: false, values: [0, resource.id] }),
          }
        : { items: [createResourceFavoriteListItem(laterResource, { userId: appUserId })], nextCursor: "" };
      isFirstPage = false;
      return page;
    });
    const favoriteStore = useFavoriteStore();
    const { favoriteIds } = storeToRefs(favoriteStore);
    const { readFavorites } = favoriteStore;
    await readFavorites();

    expect(favoriteIds.value.has(laterResource.id)).toBe(true);
  });

  // A delete or a restore changes which stars still resolve to a live resource, and the stars are rendered in
  // The very table the delete is issued from — so this is the one cache that re-reads at once rather than
  // Dropping and waiting for its next mount
  test("re-reads the favorites the moment the resources tag is invalidated", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => ResourceFavoriteListItem[]>(() => [createResourceFavoriteListItem(resource)]);
    trpcMsw.resource.readFavorites.query(() => favoritePage(handler()));
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
