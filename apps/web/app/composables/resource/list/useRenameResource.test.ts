// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useRenameResource } from "@/composables/resource/list/useRenameResource";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "@/store/resource/favorite";
import { TRPCError } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";

describe(useRenameResource, () => {
  const { trpcMsw } = setupMswTrpc();
  const name = "name";
  const newName = "newName";
  const createResource = () => ref<ResourceInResource>(createResourceListItem({ name }));

  test("renames the row optimistically and keeps the server's answer on success", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    trpcMsw.sheet.updateResource.mutation(() => ({ ...resource.value, name: newName }));
    await useRenameResource(resource, refresh)(newName);

    expect(resource.value.name).toBe(newName);
    // Called once, not called with nothing: the success path is `onSuccess: refresh`, so the mutation hands it
    // The server row that `refresh` ignores
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  // The name a local rollback would restore is whatever this call read, which for a second rename of the same row
  // Is itself the first call's optimistic value — and only the newest call's handlers run, so restoring it leaves
  // A name the server never accepted on the row. The server's answer is the only true name
  test("re-reads for the server's name instead of restoring one it never accepted", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    trpcMsw.sheet.updateResource.mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: " " });
    });
    await useRenameResource(resource, refresh)(newName);

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
    await useRenameResource(
      resource,
      vi.fn<() => Promise<void>>(() => Promise.resolve()),
    )(newName);

    expect(favorites.value.map((favorite) => favorite.name)).toStrictEqual([newName]);
  });
});
