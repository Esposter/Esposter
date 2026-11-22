// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { createResourceFavoriteListItem } from "#shared/services/resource/list/createResourceFavoriteListItem.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useRenameResource } from "#src/composables/resource/list/useRenameResource";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useOverlayStore } from "#src/store/overlay";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

// The refresh a write runs once it settles, announcing its call so a test awaits that rather than polling for it
const createRefresh = () => {
  const { promise: isCalled, resolve: onCalled } = Promise.withResolvers<void>();
  const refresh = vi.fn<() => Promise<void>>(() => {
    onCalled();
    return Promise.resolve();
  });
  return { isCalled, refresh };
};

// The row the overlay holds for a resource, which is the one the list renders and the rename applies to
const getHeldRow = (id: string) => {
  const overlayStore = useOverlayStore();
  const { view } = overlayStore;
  return view(resourceTable).value.find((row) => row.id === id);
};

describe(useRenameResource, () => {
  const { trpcMsw } = setupMswTrpc();
  const name = "name";
  const newName = "newName";
  const createResource = () => ref<ResourceInResource>(createResourceListItem({ name }));

  test("shows the new name as the rename is sent, and holds the server's answer once it lands", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(resourceTable, resource.value);
    const { isCalled, refresh } = createRefresh();
    trpcMsw.sheet.updateResource.mutation(() => ({ ...resource.value, name: newName, version: 1 }));
    useRenameResource(resource, refresh)(newName);

    expect(getHeldRow(resource.value.id)?.name).toBe(newName);

    // The refresh runs before the answer is applied, so the row is checked for the answer's version once it has landed
    await isCalled;
    await flushPromises();
    const heldRow = getHeldRow(resource.value.id);
    expect(heldRow?.name).toBe(newName);
    expect(heldRow?.version).toBe(1);
    // Called once, not called with nothing: the mutation hands the refresh the settled rename, which it ignores
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  // A refused rename drops its entry and changes nothing held, so the list shows the name the server last answered
  test("keeps the name the server holds when a rename is refused", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(resourceTable, resource.value);
    const { isCalled, refresh } = createRefresh();
    trpcMsw.sheet.updateResource.mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: " " });
    });
    useRenameResource(resource, refresh)(newName);

    await isCalled;
    await flushPromises();
    expect(getHeldRow(resource.value.id)?.name).toBe(name);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });

  // The favorites rows carry the name, and only the list's own refresh re-reads the list it renders, so a rename has
  // To invalidate the resources tag or the star set keeps the old name for the rest of the session
  test("re-reads the cached favorites so they carry the new name", async () => {
    expect.hasAssertions();

    const resource = createResource();
    let serverName = name;
    // One star of one user, so each read answers the same row the first one held
    const starOwnerId = v7();
    trpcMsw.resource.readFavorites.query(() => [
      createResourceFavoriteListItem(createResourceListItem({ id: resource.value.id, name: serverName }), {
        userId: starOwnerId,
      }),
    ]);
    trpcMsw.sheet.updateResource.mutation(() => {
      serverName = newName;
      return { ...resource.value, name: newName };
    });
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    const { readFavorites } = favoriteStore;
    await readFavorites();
    useRenameResource(
      resource,
      vi.fn<() => Promise<void>>(() => Promise.resolve()),
    )(newName);

    // The favorites are re-read once the invalidation the rename makes lands, so the new name is the one change to await
    await until(() => favorites.value[0]?.name).toBe(newName);
    expect(favorites.value.map((favorite) => favorite.name)).toStrictEqual([newName]);
  });
});
