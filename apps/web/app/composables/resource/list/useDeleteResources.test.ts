// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Router } from "vue-router";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useDeleteResources } from "#src/composables/resource/list/useDeleteResources";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "#src/store/resource/favorite";
import { RoutePath } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
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
    useDeleteResources(ref([resource]), ref(1), refresh)([resource]);

    // The navigation is made by the removal, and the refresh runs once the delete is kept, so both are awaited
    await Promise.all([isPushed, isCalled]);
    expect(push).toHaveBeenCalledExactlyOnceWith(RoutePath.ResourceExplorerAll);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  // The ids go out chunk-by-chunk and each chunk commits independently, so a failure still leaves earlier
  // Chunks deleted server-side — the one write that has to invalidate even though it reports as failed. The
  // Favorite set is read once per session, so nothing else drops the stars those rows held and Home would
  // Keep listing resources whose blade rejects every read until a reload
  test("invalidates the resources tag when a delete fails", async () => {
    expect.hasAssertions();

    const readFavorites = vi.fn<() => ResourceListItem[]>(() => []);
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
    useDeleteResources(ref([resource]), ref(1), refresh)([resource]);

    // The refresh is the error path's last step, and it runs after the invalidation has re-read the favorites
    await isCalled;
    expect(readFavorites).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });

  // A batch delete spans an arbitrary selection with no shared key, so two of them run beside each other —
  // Restoring the page as this delete found it undoes the rows the delete next to it already removed server-side
  test("rolls a failed delete back without dropping rows a delete beside it removed", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { id: "" });
    trpcMsw.resource.deleteResources.mutation(({ input }) => {
      if (input.ids.includes(resource.id)) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return [];
    });
    const items = ref([resource, otherResource]);
    const count = ref(2);
    // Each write refreshes once it has settled, the failed one from its rollback's error path and the kept one from its
    // Reconcile, so both have settled once the refresh has run twice
    const { promise: isBothSettled, resolve: onBothSettled } = Promise.withResolvers<void>();
    let settledCount = 0;
    const refresh = vi.fn<() => Promise<void>>(() => {
      settledCount += 1;
      if (settledCount === 2) onBothSettled();
      return Promise.resolve();
    });
    const deleteResources = useDeleteResources(items, count, refresh);
    deleteResources([resource]);
    deleteResources([otherResource]);

    // The failed delete's rollback is the last change, once both removals have been applied
    await isBothSettled;
    expect(items.value).toStrictEqual([resource]);
    // Untouched by either write, failed or landed: the total belongs to whatever read last counted it
    expect(count.value).toBe(2);
  });

  // The total is the server's count over the whole filter, so a delete that nudged it would land on top of a
  // Refresh that had already re-counted, and its rollback would then add back rows that count never held
  test("takes the total from a re-read rather than nudging it", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { id: "" });
    const items = ref([resource, otherResource]);
    const count = ref(2);
    // The rows on other pages are what makes the total more than this page's length
    const { promise: isRefreshed, resolve: onRefreshed } = Promise.withResolvers<void>();
    const refresh = vi.fn<() => Promise<void>>(() => {
      count.value = 3;
      onRefreshed();
      return Promise.resolve();
    });
    useDeleteResources(items, count, refresh)([resource]);

    await isRefreshed;
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(count.value).toBe(3);
  });

  test("stays put when the deleted resources are not the open one", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { id: resource.id });
    const push = vi.spyOn(router, "push").mockResolvedValue(undefined);
    const { isCalled, refresh } = createRefresh();
    useDeleteResources(ref([otherResource]), ref(1), refresh)([otherResource]);

    // The navigation decision is made when the removal is applied, before the refresh that the kept delete runs
    await isCalled;
    expect(push).not.toHaveBeenCalled();
  });
});
