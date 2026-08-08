// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";
import type { Router } from "vue-router";

import { useDeleteResources } from "@/composables/resource/list/useDeleteResources";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(useDeleteResources, () => {
  const server = setupMswTrpc();
  let router: Router;
  const resource = { id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource;
  const otherResource = { id: crypto.randomUUID(), name: "name", type: ResourceType.Sheet } as Resource;

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

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(RoutePath.ResourceExplorerAll);
  });

  // The ids go out chunk-by-chunk and each chunk commits independently, so a failure still leaves earlier
  // Chunks deleted server-side. The favorite set is read once per session, so nothing else drops the stars
  // Those rows held — Home would keep listing resources whose blade rejects every read until a reload
  test("re-reads the favorites when a delete fails", async () => {
    expect.hasAssertions();

    const readFavorites = vi.fn<() => Resource[]>(() => []);
    server.use(
      trpcMsw.resource.deleteResources.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.resource.readFavorites.query(readFavorites),
    );
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    await useDeleteResources(ref([resource]), ref(1), refresh)([resource]);

    expect(readFavorites).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("stays put when the deleted resources are not the open one", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.id = resource.id;
    const push = vi.spyOn(router, "push").mockResolvedValue(undefined);
    await useDeleteResources(ref([otherResource]), ref(1), () => Promise.resolve())([otherResource]);

    expect(push).not.toHaveBeenCalled();
  });
});
