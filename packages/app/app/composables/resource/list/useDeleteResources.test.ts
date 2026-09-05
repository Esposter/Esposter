// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Router } from "vue-router";

import { useDeleteResources } from "@/composables/resource/list/useDeleteResources";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useFavoriteStore } from "@/store/resource/favorite";
import { RoutePath } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(useDeleteResources, () => {
  const server = setupMswTrpc();
  let router: Router;
  const resource = createResourceListItem();
  const otherResource = createResourceListItem();

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    server.use(trpcMsw.resource.deleteResources.mutation(() => []));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The list also drives the blade's Explorer, so deleting the resource the blade is open on has to leave it —
  // Otherwise every later blade action throws UNAUTHORIZED and the editor error-toasts on each autosave
  test("leaves a blade whose resource the list deleted", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.id = resource.id;
    const push = vi.spyOn(router, "push").mockResolvedValue(undefined);
    await useDeleteResources(ref([resource]), ref(1), () => Promise.resolve())([resource]);

    expect(push).toHaveBeenCalledExactlyOnceWith(RoutePath.ResourceExplorerAll);
  });

  // The ids go out chunk-by-chunk and each chunk commits independently, so a failure still leaves earlier
  // Chunks deleted server-side — the one write that has to invalidate even though it reports as failed. The
  // Favorite set is read once per session, so nothing else drops the stars those rows held and Home would
  // Keep listing resources whose blade rejects every read until a reload
  test("invalidates the resources tag when a delete fails", async () => {
    expect.hasAssertions();

    const readFavorites = vi.fn<() => ResourceListItem[]>(() => []);
    server.use(
      trpcMsw.resource.deleteResources.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.resource.readFavorites.query(readFavorites),
    );
    // The table the delete is issued from renders the stars, so the favorites cache is loaded by this point —
    // A cache that was never constructed holds nothing stale and is nothing to invalidate
    const favoriteStore = useFavoriteStore();
    const { readFavorites: readCachedFavorites } = favoriteStore;
    await readCachedFavorites();
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    await useDeleteResources(ref([resource]), ref(1), refresh)([resource]);

    expect(readFavorites).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });

  // A batch delete spans an arbitrary selection with no shared key, so two of them run beside each other —
  // Restoring the page as this delete found it undoes the rows the delete next to it already removed server-side
  test("rolls a failed delete back without dropping rows a delete beside it removed", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.id = "";
    server.use(
      trpcMsw.resource.deleteResources.mutation(({ input }) => {
        if (input.ids.includes(resource.id)) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return [];
      }),
    );
    const items = ref([resource, otherResource]);
    const count = ref(2);
    const deleteResources = useDeleteResources(items, count, () => Promise.resolve());
    await Promise.all([deleteResources([resource]), deleteResources([otherResource])]);

    expect(items.value).toStrictEqual([resource]);
    // Untouched by either write, failed or landed: the total belongs to whatever read last counted it
    expect(count.value).toBe(2);
  });

  // The total is the server's count over the whole filter, so a delete that nudged it would land on top of a
  // Refresh that had already re-counted, and its rollback would then add back rows that count never held
  test("takes the total from a re-read rather than nudging it", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.id = "";
    const items = ref([resource, otherResource]);
    const count = ref(2);
    // The rows on other pages are what makes the total more than this page's length
    const refresh = vi.fn<() => Promise<void>>(() => {
      count.value = 7;
      return Promise.resolve();
    });
    await useDeleteResources(items, count, refresh)([resource]);

    expect(refresh).toHaveBeenCalledExactlyOnceWith();
    expect(count.value).toBe(7);
  });

  test("stays put when the deleted resources are not the open one", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.id = resource.id;
    const push = vi.spyOn(router, "push").mockResolvedValue(undefined);
    await useDeleteResources(ref([otherResource]), ref(1), () => Promise.resolve())([otherResource]);

    expect(push).not.toHaveBeenCalled();
  });
});
