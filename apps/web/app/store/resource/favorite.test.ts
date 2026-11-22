// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { createResourceListItemWithFavorite } from "#shared/services/resource/list/createResourceListItemWithFavorite.test";
import { useReadFavorites } from "#src/composables/resource/useReadFavorites";
import { setupSession } from "#src/services/auth/setupSession.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { useRecentStore } from "#src/store/resource/recent";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useFavoriteStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUserId = v7();
  setupSession(appUserId);
  const resource = createResourceListItem();
  // The clock starts at the epoch, so a removal dated the epoch is still inside the tombstone retention
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  // The row the server answers a set or removed star with, at the version it was written at
  const createStarRow = (starred: typeof resource, deletedAt: Date | null) => ({
    createdAt: new Date(0),
    deletedAt,
    resourceId: starred.id,
    updatedAt: new Date(0),
    userId: appUserId,
    version: 1,
  });

  // A row a list read answers holds its star, so the row shows it without a favorites read of its own
  test("holds the star a row read answers, so the row shows it", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readResources.query(() => ({
      items: [createResourceListItemWithFavorite(resource, { userId: appUserId })],
      nextCursor: "",
    }));
    const recentStore = useRecentStore();
    const { readRecents } = recentStore;
    const favoriteStore = useFavoriteStore();
    const { favoriteIds } = storeToRefs(favoriteStore);
    await readRecents();

    expect(favoriteIds.value.has(resource.id)).toBe(true);
  });

  // A star is set on screen before the server answers, and the answer that comes back as a tombstone takes over
  test("drops a star the favorites list shows once the server answers it removed", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readFavorites.query(() => ({
      items: [createResourceListItemWithFavorite(resource, { userId: appUserId })],
      nextCursor: "",
    }));
    trpcMsw.resource.toggleFavorite.mutation(() => createStarRow(resource, new Date()));
    const { readFavorites } = useReadFavorites();
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { toggleFavorite } = favoriteStore;
    await readFavorites();
    toggleFavorite(resource);
    await flushPromises();

    expect(favorites.value).toStrictEqual([]);
  });

  // Two quick clicks on one star queue on the same row: the second click removes what the first set, and when it is
  // Refused the row is the one the first click's answer holds, so the star stays set
  test("keeps the star the first of two quick toggles set when the second is refused", async () => {
    expect.hasAssertions();

    let isFirstToggle = true;
    trpcMsw.resource.toggleFavorite.mutation(() => {
      if (!isFirstToggle) throw trpcError;

      isFirstToggle = false;
      return createStarRow(resource, null);
    });
    const favoriteStore = useFavoriteStore();
    const { favoriteIds } = storeToRefs(favoriteStore);
    const { toggleFavorite } = favoriteStore;
    toggleFavorite(resource);
    toggleFavorite(resource);
    await flushPromises();

    expect(favoriteIds.value.has(resource.id)).toBe(true);
  });
});
