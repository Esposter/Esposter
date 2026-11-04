// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { createGroupChain } from "#shared/services/dashboard/createGroupChain.test";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { takeOne, toRawDeep } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

// The visual store reads its visuals straight off the dashboard store's content, so the dashboard has to be
// Loaded before there is anything to edit — and before a save has a resource to write to
const setupStore = async () => {
  const dashboardStore = useDashboardStore();
  const { loadContent } = dashboardStore;
  await loadContent();
  return useVisualStore();
};
// The dialog hands `save` a clone of the visual, the way createEditFormData stages every edit
const createEditedVisual = (visual: Visual, type: VisualType) => {
  const editedVisual = structuredClone(toRawDeep(visual));
  editedVisual.type = type;
  return editedVisual;
};

describe(useVisualStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Dashboard });
  let content: Dashboard;

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    content = new Dashboard({ visuals: [new Visual({ type: VisualType.Area })] });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.dashboard.readResourceContent.query(() => content);
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.saveResourceContent.mutation(() => createResource(1));
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  test("closes the dialog when the edit lands", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { save } = visualStore;
    const { isEditFormDialogOpen, visuals } = storeToRefs(visualStore);
    isEditFormDialogOpen.value = true;
    const isSuccessful = await save(createEditedVisual(takeOne(visuals.value), VisualType.Bar));

    expect(isSuccessful).toBe(true);
    expect(takeOne(visuals.value).type).toBe(VisualType.Bar);
    expect(isEditFormDialogOpen.value).toBe(false);
  });

  // A published dashboard bakes its data into each binding, and a copy that kept it would draw that frozen data forever
  test("duplicates a visual under the original, bound to its source rather than its published data", async () => {
    expect.hasAssertions();

    const dataset = {
      query: { series: [{ aggregation: DatasetAggregationType.Sum, column: "column" }], xColumn: "xColumn" },
      reference: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
    };
    content = new Dashboard({
      visuals: [new Visual({ dataset: { ...dataset, snapshot: { columns: [], rows: [] } } })],
    });
    const visualStore = await setupStore();
    const { duplicateVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const visual = takeOne(visuals.value);
    const isSuccessful = await duplicateVisual({ id: visual.id });
    const duplicatedVisual = takeOne(visuals.value, 1);

    expect(isSuccessful).toBe(true);
    expect(duplicatedVisual.id).not.toBe(visual.id);
    expect(duplicatedVisual.dataset).toStrictEqual(dataset);
    expect(duplicatedVisual.y).toBe(visual.y + visual.h);
  });

  test("duplicating a fit-height visual keeps fit height", async () => {
    expect.hasAssertions();

    content = new Dashboard({ visuals: [new Visual({ isAutoHeight: true, type: VisualType.Table })] });
    const visualStore = await setupStore();
    const { duplicateVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const isSuccessful = await duplicateVisual({ id: takeOne(visuals.value).id });
    const duplicatedVisual = takeOne(visuals.value, 1);

    expect(isSuccessful).toBe(true);
    expect(duplicatedVisual.isAutoHeight).toBe(true);
  });

  // A visual removed while its dialog was open has nothing to save onto, so the save is refused before the dashboard
  // Is written and the dialog stays open on the draft
  test("refuses an edit whose visual was removed and keeps the dialog open", async () => {
    expect.hasAssertions();

    const saveResourceContent = vi.fn<() => ReturnType<typeof createResource>>(() => createResource(1));
    trpcMsw.dashboard.saveResourceContent.mutation(saveResourceContent);
    const visualStore = await setupStore();
    const { save } = visualStore;
    const { isEditFormDialogOpen } = storeToRefs(visualStore);
    isEditFormDialogOpen.value = true;
    const isSuccessful = await save(new Visual({ type: VisualType.Bar }));

    expect(isSuccessful).toBe(false);
    expect(isEditFormDialogOpen.value).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // The dashboard is persisted wholesale, so a rejected write has to leave the visual showing what the server
  // Still has — and the dialog open, or the user's draft is gone with no way to retry it
  test("reverts the visual and keeps the dialog open when the save fails", async () => {
    expect.hasAssertions();

    trpcMsw.dashboard.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const visualStore = await setupStore();
    const { save } = visualStore;
    const { isEditFormDialogOpen, visuals } = storeToRefs(visualStore);
    isEditFormDialogOpen.value = true;
    const isSuccessful = await save(createEditedVisual(takeOne(visuals.value), VisualType.Bar));

    expect(takeOne(visuals.value).type).toBe(VisualType.Area);
    expect(isEditFormDialogOpen.value).toBe(true);
    expect(isSuccessful).toBe(false);
  });

  // A save is not instant, so the user can add a visual while one is in flight
  test("keeps a visual added while the edit was in flight when the save fails", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { createVisual, save } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    trpcMsw.dashboard.saveResourceContent.mutation(() => {
      createVisual();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
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
    trpcMsw.dashboard.saveResourceContent.mutation(() => {
      createVisual();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const isSuccessful = await deleteVisual({ id });

    expect(isSuccessful).toBe(false);
    expect(visuals.value).toHaveLength(2);
    expect(visuals.value.some((visual) => visual.id === id)).toBe(true);
  });

  // The rollback lands after the save's await, and by then the blade may hold another dashboard — put back through
  // Whichever dashboard is open, the deleted visual would appear in that one and be saved into it by its next edit
  test("puts a visual whose delete failed back into its own dashboard only", async () => {
    expect.hasAssertions();

    const otherResourceId = crypto.randomUUID();
    const otherContent = new Dashboard();
    const { promise: saveGate, resolve: releaseSave } = Promise.withResolvers<void>();
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResourceListItem({ id: input.id, type: ResourceType.Dashboard }),
      publication: null,
    }));
    trpcMsw.dashboard.readResourceContent.query(({ input }) => (input.id === resourceId ? content : otherContent));
    trpcMsw.dashboard.saveResourceContent.mutation(async () => {
      await saveGate;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const visualStore = await setupStore();
    const { deleteVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const deletion = deleteVisual({ id: takeOne(visuals.value).id });
    Object.assign(useRouter().currentRoute.value.params, { id: otherResourceId });
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const dashboardStore = useDashboardStore();
    const { loadContent } = dashboardStore;
    await loadContent();
    releaseSave();
    await deletion;

    expect(visuals.value).toStrictEqual([]);
  });

  // The first free cell is the one a new visual of its span fits in, scanning rows from the top
  test("a new visual takes the first free cell beside the visuals there are", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { createVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    createVisual();

    expect(visuals.value).toHaveLength(2);
    expect({ w: visuals.value[1]?.w, x: visuals.value[1]?.x, y: visuals.value[1]?.y }).toStrictEqual({
      w: 4,
      x: 4,
      y: 0,
    });
  });

  // A fit height the server refuses is taken back, so the menu shows the flag the saved visual has
  test("takes a fit height back when the save is refused", async () => {
    expect.hasAssertions();

    const visualStore = await setupStore();
    const { setAutoHeight } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const { id } = takeOne(visuals.value);
    trpcMsw.dashboard.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const isSuccessful = await setAutoHeight({ id }, true);

    expect(isSuccessful).toBe(false);
    expect(takeOne(visuals.value).isAutoHeight).toBe(false);
  });

  // A group takes the visual into its own list, and the dashboard's own list is left as it was
  test("adds a visual into a group, leaving the dashboard's own list as it was", async () => {
    expect.hasAssertions();

    content = new Dashboard({ visuals: [new Visual({ type: VisualType.Group, visuals: [] })] });
    const visualStore = await setupStore();
    const { createVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const group = takeOne(visuals.value);
    createVisual(VisualType.Bar, group.id);

    expect(visuals.value).toHaveLength(1);
    expect(group.visuals?.map(({ type }) => type)).toStrictEqual([VisualType.Bar]);
  });

  // A group at the depth cap holds plain visuals only, so a group added inside it is refused and nothing is added
  test("refuses adding a group inside a group at the depth cap", async () => {
    expect.hasAssertions();

    content = new Dashboard({ visuals: createGroupChain(MAX_VISUAL_GROUP_DEPTH + 1) });
    const visualStore = await setupStore();
    const { createVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const deepestGroup = takeOne(listVisuals(visuals.value), MAX_VISUAL_GROUP_DEPTH);
    createVisual(VisualType.Group, deepestGroup.id);

    expect(listVisuals(visuals.value)).toHaveLength(MAX_VISUAL_GROUP_DEPTH + 2);
  });

  test("deleting a group removes the visuals it holds with it", async () => {
    expect.hasAssertions();

    content = new Dashboard({
      visuals: [new Visual({ type: VisualType.Group, visuals: [new Visual({ type: VisualType.Bar })] })],
    });
    const visualStore = await setupStore();
    const { deleteVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const isSuccessful = await deleteVisual({ id: takeOne(visuals.value).id });

    expect(isSuccessful).toBe(true);
    expect(visuals.value).toStrictEqual([]);
  });

  // A copy of a group takes a fresh id everywhere in its subtree, so no two visuals in the tree share one
  test("duplicates a group with fresh ids for every visual it holds", async () => {
    expect.hasAssertions();

    content = new Dashboard({
      visuals: [new Visual({ type: VisualType.Group, visuals: [new Visual({ type: VisualType.Bar })] })],
    });
    const visualStore = await setupStore();
    const { duplicateVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const isSuccessful = await duplicateVisual({ id: takeOne(visuals.value).id });
    const treeVisuals = listVisuals(visuals.value);

    expect(isSuccessful).toBe(true);
    expect(treeVisuals.map(({ type }) => type)).toStrictEqual([
      VisualType.Group,
      VisualType.Bar,
      VisualType.Group,
      VisualType.Bar,
    ]);
    expect(new Set(treeVisuals.map(({ id }) => id)).size).toBe(treeVisuals.length);
  });

  // A visual moves with the visuals it holds into another group, at the cell it is dropped on
  test("moves a visual with its subtree into a group at the cell given", async () => {
    expect.hasAssertions();

    content = new Dashboard({
      visuals: [
        new Visual({ type: VisualType.Group, visuals: [new Visual({ type: VisualType.Bar })] }),
        new Visual({ type: VisualType.Group, visuals: [] }),
      ],
    });
    const visualStore = await setupStore();
    const { moveVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const [movedGroup, targetGroup] = visuals.value;
    assert.exists(movedGroup);
    assert.exists(targetGroup);
    moveVisual({ id: movedGroup.id }, targetGroup.id, { h: 4, w: 4, x: 2, y: 1 });

    expect(visuals.value.map(({ id }) => id)).toStrictEqual([targetGroup.id]);
    expect(targetGroup.visuals?.map(({ id }) => id)).toStrictEqual([movedGroup.id]);
    expect(movedGroup.visuals?.map(({ type }) => type)).toStrictEqual([VisualType.Bar]);
    expect({ x: movedGroup.x, y: movedGroup.y }).toStrictEqual({ x: 2, y: 1 });
  });

  // A move is checked against the depth of every group it carries, so a group moved one level too deep is refused whole
  test("refuses a move that nests a group past the depth cap", async () => {
    expect.hasAssertions();

    content = new Dashboard({
      visuals: [
        new Visual({ type: VisualType.Group, visuals: createGroupChain(MAX_VISUAL_GROUP_DEPTH) }),
        new Visual({ type: VisualType.Group, visuals: createGroupChain(1) }),
      ],
    });
    const visualStore = await setupStore();
    const { moveVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const [deepTree, shallowTree] = visuals.value;
    assert.exists(deepTree);
    assert.exists(shallowTree);
    const shallowGroup = takeOne(shallowTree.visuals ?? []);
    // The deepest group of the first tree sits at the depth cap, so a group moved into it nests one level past the cap
    moveVisual({ id: shallowGroup.id }, takeOne(listVisuals([deepTree]), MAX_VISUAL_GROUP_DEPTH).id, {
      h: 4,
      w: 4,
      x: 0,
      y: 0,
    });

    expect(shallowTree.visuals?.map(({ id }) => id)).toStrictEqual([shallowGroup.id]);
    expect(visuals.value).toHaveLength(2);
  });

  // A group moved into a group it holds would detach itself from the tree, so the move is refused
  test("refuses to move a group into a group it holds", async () => {
    expect.hasAssertions();

    content = new Dashboard({
      visuals: [new Visual({ type: VisualType.Group, visuals: [new Visual({ type: VisualType.Group, visuals: [] })] })],
    });
    const visualStore = await setupStore();
    const { moveVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const outerGroup = takeOne(visuals.value);
    const innerGroup = takeOne(outerGroup.visuals ?? []);
    moveVisual({ id: outerGroup.id }, innerGroup.id, { h: 4, w: 4, x: 0, y: 0 });

    expect(visuals.value.map(({ id }) => id)).toStrictEqual([outerGroup.id]);
    expect(outerGroup.visuals?.map(({ id }) => id)).toStrictEqual([innerGroup.id]);
  });

  // An id names the visual wherever it sits, so a write aimed at a visual held by a group lands on that visual
  test("updates a visual held by a group by its id alone", async () => {
    expect.hasAssertions();

    content = new Dashboard({
      visuals: [new Visual({ type: VisualType.Group, visuals: [new Visual({ type: VisualType.Bar })] })],
    });
    const visualStore = await setupStore();
    const { updateVisual } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const held = takeOne(takeOne(visuals.value).visuals ?? []);
    updateVisual({ id: held.id, x: 3 });

    expect(held.x).toBe(3);
  });

  // The edit form copies a group as it stood when it opened, so saving it keeps the visuals added to the group since
  test("keeps the visuals a group holds when its edit is saved", async () => {
    expect.hasAssertions();

    content = new Dashboard({ visuals: [new Visual({ type: VisualType.Group, visuals: [] })] });
    const visualStore = await setupStore();
    const { createVisual, save } = visualStore;
    const { visuals } = storeToRefs(visualStore);
    const group = takeOne(visuals.value);
    const editedGroup = createEditedVisual(group, VisualType.Group);
    createVisual(VisualType.Bar, group.id);
    const isSuccessful = await save(editedGroup);

    expect(isSuccessful).toBe(true);
    expect(group.visuals?.map(({ type }) => type)).toStrictEqual([VisualType.Bar]);
  });
});
