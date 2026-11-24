// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { createResourceListItemWithFavorite } from "#shared/services/resource/list/createResourceListItemWithFavorite.test";
import { useRenameResource } from "#src/composables/resource/list/useRenameResource";
import { useReadFavorites } from "#src/composables/resource/useReadFavorites";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useOverlayStore } from "#src/store/overlay";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
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
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
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

  // The favorites list draws each row from the overlay, so the rename shows on it as the rename is sent, with no
  // Re-read
  test("shows the new name on the favorites list as the rename is sent", async () => {
    expect.hasAssertions();

    const resource = createResource();
    trpcMsw.resource.readFavorites.query(() => ({
      items: [createResourceListItemWithFavorite(createResourceListItem({ id: resource.value.id, name }))],
      nextCursor: "",
    }));
    trpcMsw.sheet.updateResource.mutation(() => ({ ...resource.value, name: newName, version: 1 }));
    const { readFavorites } = useReadFavorites();
    const favoriteStore = useFavoriteStore();
    const { favorites } = storeToRefs(favoriteStore);
    await readFavorites();
    const { isCalled, refresh } = createRefresh();
    useRenameResource(resource, refresh)(newName);

    expect(favorites.value.map((favorite) => favorite.name)).toStrictEqual([newName]);

    // The rename settles within the test, so its request is answered before the test ends
    await isCalled;
    await flushPromises();
  });
});
