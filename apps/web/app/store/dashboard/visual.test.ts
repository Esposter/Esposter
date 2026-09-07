// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { ResourceType } from "@esposter/db-schema";
import { takeOne, toRawDeep } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

// The visual store reads its visuals straight off the dashboard store's content, so the dashboard has to be
// Loaded before there is anything to edit — and before a save has a resource to write to
const setupStore = async () => {
  const dashboardStore = useDashboardStore();
  await dashboardStore.loadContent();
  return useVisualStore();
};
// The dialog hands `save` a clone of the visual, the way createEditFormData stages every edit
const createEditedVisual = (visual: Visual, type: VisualType) => {
  const editedVisual = structuredClone(toRawDeep(visual));
  editedVisual.type = type;
  return editedVisual;
};

describe(useVisualStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Dashboard });
  let content: Dashboard;

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = new Dashboard({ visuals: [new Visual({ type: VisualType.Area })] });
    server.use(
      trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null })),
      trpcMsw.dashboard.readResourceContent.query(() => content),
      trpcMsw.dashboard.readResourcePublication.query(() => undefined),
      trpcMsw.dashboard.saveResourceContent.mutation(() => createResource(1)),
    );
  });

  test("closes the dialog when the edit lands", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { save } = visualStore;
    const { editFormDialog, visuals } = storeToRefs(visualStore);
    editFormDialog.value = true;
    const isSuccessful = await save(createEditedVisual(takeOne(visuals.value), VisualType.Bar));

    expect(isSuccessful).toBe(true);
    expect(takeOne(visuals.value).type).toBe(VisualType.Bar);
    expect(editFormDialog.value).toBe(false);
  });

  // The dashboard is persisted wholesale, so a rejected write has to leave the visual showing what the server
  // Still has — and the dialog open, or the user's draft is gone with no way to retry it
  test("reverts the visual and keeps the dialog open when the save fails", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.dashboard.saveResourceContent.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const visualStore = await setupStore();
    const { save } = visualStore;
    const { editFormDialog, visuals } = storeToRefs(visualStore);
    editFormDialog.value = true;
    const isSuccessful = await save(createEditedVisual(takeOne(visuals.value), VisualType.Bar));

    expect(takeOne(visuals.value).type).toBe(VisualType.Area);
    expect(editFormDialog.value).toBe(true);
    expect(isSuccessful).toBe(false);
  });

  // A save is not instant, so the user can add a visual while one is in flight
  test("keeps a visual added while the edit was in flight when the save fails", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { createVisual, save } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    server.use(
      trpcMsw.dashboard.saveResourceContent.mutation(() => {
        createVisual();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const isSuccessful = await save(createEditedVisual(takeOne(visuals.value), VisualType.Bar));

    expect(isSuccessful).toBe(false);
    expect(visuals.value).toHaveLength(2);
    expect(takeOne(visuals.value).type).toBe(VisualType.Area);
  });

  // Same for the delete path, which unwinds by putting its own visual back
  test("keeps a visual added while the delete was in flight when the save fails", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { createVisual, deleteVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const { id } = takeOne(visuals.value);
    server.use(
      trpcMsw.dashboard.saveResourceContent.mutation(() => {
        createVisual();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const isSuccessful = await deleteVisual({ id });

    expect(isSuccessful).toBe(false);
    expect(visuals.value).toHaveLength(2);
    expect(visuals.value.some((visual) => visual.id === id)).toBe(true);
  });
});
