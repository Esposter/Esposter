// @vitest-environment nuxt
import type { PageCursor } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { createResourceListItemWithFavorite } from "#shared/services/resource/list/createResourceListItemWithFavorite.test";
import { useReadFavorites } from "#src/composables/resource/useReadFavorites";
import { setupSession } from "#src/services/auth/setupSession.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { encodePageCursor, START_PAGE_CURSOR } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadFavorites, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUserId = v7();
  setupSession(appUserId);

  // The favorites list pages like any other: the first page, then the page after the last one shown. Each read's cursor,
  // As the server parsed it, is kept in the order the reads came
  test("pages the favorites list, each page after the last one shown", async () => {
    expect.hasAssertions();

    const resource = createResourceListItem();
    const laterResource = createResourceListItem();
    const nextPageCursor: PageCursor = { isBackward: false, values: [0, resource.id] };
    const sentCursors: unknown[] = [];
    trpcMsw.resource.readFavorites.query(({ input }) => {
      sentCursors.push(input?.cursor);
      return sentCursors.length === 1
        ? {
            items: [createResourceListItemWithFavorite(resource, { userId: appUserId })],
            nextCursor: encodePageCursor(nextPageCursor),
          }
        : { items: [createResourceListItemWithFavorite(laterResource, { userId: appUserId })], nextCursor: "" };
    });
    const { readFavorites, readMoreFavorites } = useReadFavorites();
    const favoriteStore = useFavoriteStore();
    const { favorites, hasMore } = storeToRefs(favoriteStore);
    await readFavorites();

    expect(favorites.value.map(({ id }) => id)).toStrictEqual([resource.id]);
    expect(hasMore.value).toBe(true);

    await readMoreFavorites(() => {});

    expect(sentCursors).toStrictEqual([START_PAGE_CURSOR, nextPageCursor]);
    expect(favorites.value.map(({ id }) => id)).toStrictEqual([resource.id, laterResource.id]);
    expect(hasMore.value).toBe(false);
  });
});
