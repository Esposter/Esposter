// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDashboardStore } from "#src/store/dashboard/index";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

describe(useDashboardStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Dashboard });

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard());
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.saveResourceContent.mutation(() => createResource(1));
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  // The first save is held in flight and refused. The second write queues behind it and succeeds, so the collision it chose stands
  test("a refused save leaves a later change standing", async () => {
    expect.hasAssertions();

    const dashboardStore = useDashboardStore();
    const { loadContent, setLayout } = dashboardStore;
    await loadContent();
    const { promise: saveGate, resolve: releaseSave } = Promise.withResolvers<void>();
    let saveCount = 0;
    trpcMsw.dashboard.saveResourceContent.mutation(async () => {
      saveCount++;
      if (saveCount === 1) {
        await saveGate;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }
      return createResource(saveCount);
    });
    setLayout({ collision: CollisionMode.Prevent, compactType: CompactType.Vertical });
    setLayout({ collision: CollisionMode.Swap, compactType: CompactType.Vertical });
    releaseSave();
    await waitForSynchronizedFunctions();

    expect(dashboardStore.dashboard.collision).toBe(CollisionMode.Swap);
  });
});
