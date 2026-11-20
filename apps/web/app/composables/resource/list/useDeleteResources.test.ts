// @vitest-environment nuxt
import type { ResourceFavoriteListItem } from "#shared/models/resource/ResourceFavoriteListItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Router } from "vue-router";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useDeleteResources } from "#src/composables/resource/list/useDeleteResources";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useOverlayStore } from "#src/store/overlay";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { MAX_READ_LIMIT, RoutePath } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The refresh a write runs once it settles, announcing its call so a test awaits that rather than polling for it
const createRefresh = () => {
  const { promise: isCalled, resolve: onCalled } = Promise.withResolvers<void>();
  const refresh = vi.fn<() => Promise<void>>(() => {
    onCalled();
    return Promise.resolve();
  });
  return { isCalled, refresh };
};

// The row a removal answers with: the resource as the server holds it once deleted, at the version the removal raised it to
const createRemovedRow = (resource: ResourceListItem) => ({
  ...resource,
  deletedAt: new Date(0),
  version: resource.version + 1,
});

// The ids of the resources the overlay holds live, which is what the list shows once it has its page
const getLiveIds = () => {
  const overlayStore = useOverlayStore();
  const { view } = overlayStore;
  return view(resourceTable).value.map(({ id }) => id);
};

describe(useDeleteResources, () => {
  const { trpcMsw } = setupMswTrpc();
  let router: Router;
  const resource = createResourceListItem();
  const otherResource = createResourceListItem();

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    trpcMsw.resource.deleteResources.mutation(() => []);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The list also drives the blade's Explorer, so deleting the resource the blade is open on has to leave it —
  // Otherwise every later blade action throws UNAUTHORIZED and the editor error-toasts on each autosave
  test("leaves a blade whose resource the list deleted", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { id: resource.id });
    const { promise: isPushed, resolve: onPushed } = Promise.withResolvers<void>();
    const push = vi.spyOn(router, "push").mockImplementation(() => {
      onPushed();
      return Promise.resolve(undefined);
    });
    const { isCalled, refresh } = createRefresh();
    useDeleteResources(refresh)([resource]);

    // The navigation is made by the removal, and the refresh runs once the delete is kept, so both are awaited
    await Promise.all([isPushed, isCalled]);
    expect(push).toHaveBeenCalledExactlyOnceWith(RoutePath.ResourceExplorerAll);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  // A resource the list holds drops out of it as the delete is sent, before the server has answered
  test("hides a deleted resource as the delete is sent, and keeps it hidden once the answer lands", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(resourceTable, resource);
    overlayStore.arrive(resourceTable, otherResource);
    trpcMsw.resource.deleteResources.mutation(() => [createRemovedRow(resource)]);
    const { isCalled, refresh } = createRefresh();
    useDeleteResources(refresh)([resource]);

    expect(getLiveIds()).toStrictEqual([otherResource.id]);

    // The refresh runs before the answer is applied, so the rows are checked again once the answer has landed
    await isCalled;
    await flushPromises();
    expect(getLiveIds()).toStrictEqual([otherResource.id]);
  });

  // The ids go out chunk-by-chunk and each chunk commits independently, so a failure still leaves earlier chunks
  // Deleted server-side — the one write that has to invalidate even though it reports as failed. The favorite set is
  // Read once per session, so nothing else drops the stars those rows held and Home would keep listing resources whose
  // Blade rejects every read until a reload
  test("invalidates the resources tag when a delete fails", async () => {
    expect.hasAssertions();

    const readFavorites = vi.fn<() => ResourceFavoriteListItem[]>(() => []);
    trpcMsw.resource.deleteResources.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.resource.readFavorites.query(readFavorites);
    // The table the delete is issued from renders the stars, so the favorites cache is loaded by this point —
    // A cache that was never constructed holds nothing stale and is nothing to invalidate
    const favoriteStore = useFavoriteStore();
    const { readFavorites: readCachedFavorites } = favoriteStore;
    await readCachedFavorites();
    const { isCalled, refresh } = createRefresh();
    useDeleteResources(refresh)([resource]);

    // The refresh is the error path's last step, and it runs after the invalidation has re-read the favorites
    await isCalled;
    expect(readFavorites).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });

  // A batch delete spans an arbitrary selection with no shared key, so two of them run beside each other. A failed one
  // Leaves its resources where they stood, and the removal the other one made stays
  test("keeps a removal beside a failed delete", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { id: "" });
    const overlayStore = useOverlayStore();
    overlayStore.arrive(resourceTable, resource);
    overlayStore.arrive(resourceTable, otherResource);
    trpcMsw.resource.deleteResources.mutation(({ input }) => {
      if (input.ids.includes(resource.id)) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return [createRemovedRow(otherResource)];
    });
    // Each write refreshes once it has settled, the failed one from its error path and the kept one before its answer,
    // So both have settled once the refresh has run twice
    const { promise: isBothSettled, resolve: onBothSettled } = Promise.withResolvers<void>();
    let settledCount = 0;
    const refresh = vi.fn<() => Promise<void>>(() => {
      settledCount += 1;
      if (settledCount === 2) onBothSettled();
      return Promise.resolve();
    });
    const deleteResources = useDeleteResources(refresh);
    deleteResources([resource]);
    deleteResources([otherResource]);

    await isBothSettled;
    await flushPromises();
    expect(getLiveIds()).toStrictEqual([resource.id]);
  });

  // A chunk the server answers lands as it is answered, so a later chunk the server refuses leaves the earlier chunk's rows
  // Deleted on screen as they are on the server, rather than holding them live behind the refused write
  test("keeps the rows an earlier chunk deleted removed when a later chunk is refused", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const acceptedResources = Array.from({ length: MAX_READ_LIMIT }, () => createResourceListItem());
    const refusedResource = createResourceListItem();
    for (const selectedResource of [...acceptedResources, refusedResource])
      overlayStore.arrive(resourceTable, selectedResource);
    trpcMsw.resource.deleteResources.mutation(({ input }) => {
      if (input.ids.includes(refusedResource.id)) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return acceptedResources.map((acceptedResource) => createRemovedRow(acceptedResource));
    });
    const { isCalled, refresh } = createRefresh();
    useDeleteResources(refresh)([...acceptedResources, refusedResource]);

    await isCalled;
    await flushPromises();
    expect(getLiveIds()).toStrictEqual([refusedResource.id]);
  });

  test("stays put when the deleted resources are not the open one", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { id: resource.id });
    const push = vi.spyOn(router, "push").mockResolvedValue(undefined);
    const { isCalled, refresh } = createRefresh();
    useDeleteResources(refresh)([otherResource]);

    // The navigation decision is made when the removal is applied, before the refresh that the kept delete runs
    await isCalled;
    expect(push).not.toHaveBeenCalled();
  });
});
