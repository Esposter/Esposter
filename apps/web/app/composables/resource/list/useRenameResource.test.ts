// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useRenameResource } from "#src/composables/resource/list/useRenameResource";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { TRPCError } from "@trpc/server";
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

describe(useRenameResource, () => {
  const { trpcMsw } = setupMswTrpc();
  const name = "name";
  const newName = "newName";
  const createResource = () => ref<ResourceInResource>(createResourceListItem({ name }));

  test("renames the row optimistically and keeps the server's answer on success", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const { isCalled, refresh } = createRefresh();
    trpcMsw.sheet.updateResource.mutation(() => ({ ...resource.value, name: newName }));
    useRenameResource(resource, refresh)(newName);

    await isCalled;
    expect(resource.value.name).toBe(newName);
    // Called once, not called with nothing: the success path is `reconcile: refresh`, so the mutation hands it
    // The server row that `refresh` ignores
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  // The name a local rollback would restore is whatever this call read, which for a second rename of the same row
  // Is itself the first call's optimistic value — and only the newest call's handlers run, so restoring it leaves
  // A name the server never accepted on the row. The server's answer is the only true name
  test("re-reads for the server's name instead of restoring one it never accepted", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const { isCalled, refresh } = createRefresh();
    trpcMsw.sheet.updateResource.mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: " " });
    });
    useRenameResource(resource, refresh)(newName);

    await isCalled;
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });

  // The favorites rows carry the name, and only the list's own refresh re-reads the list it renders, so a rename has
  // To invalidate the resources tag or the star set keeps the old name for the rest of the session
  test("re-reads the cached favorites so they carry the new name", async () => {
    expect.hasAssertions();

    const resource = createResource();
    let serverName = name;
    trpcMsw.resource.readFavorites.query(() => [createResourceListItem({ id: resource.value.id, name: serverName })]);
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
