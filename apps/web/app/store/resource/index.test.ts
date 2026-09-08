// @vitest-environment nuxt
import type { NoteResource } from "#shared/models/resource/note/NoteResource";
import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Sheet is not publishable and Note is, so the pair covers both sides of every capability gate below
const createResource = (id: string, type = ResourceType.Sheet) => createResourceListItem({ id, type });
// The unpublished answer the read carries, which is what a publishable type's test overrides
type ReadResourceResult = ReturnType<typeof createResource> & { publication: null };
// The route is what the store loads from, so switching resources in a test is switching the route
const setRouteId = (id: string) => {
  useRouter().currentRoute.value.params.id = id;
};

describe(useResourceStore, () => {
  const server = setupMswTrpc();
  // Held as a spy rather than an inline resolver, so a test can assert the read was never issued at all
  let readResourceQuery: ReturnType<typeof vi.fn<(options: { input: { id: string } }) => ReadResourceResult>>;
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
  const newName = "newName";
  const failingName = "failingName";
  const tags: ResourceTags = { env: "prod" };
  const publication = {
    publishedAt: new Date(0),
    publishVersion: 1,
    resourceId,
  } as ResourcePublication;
  // A Note loads its publication on the way in, so the unpublished answer is the baseline a test overrides
  const setupNoteResource = () => {
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id, ResourceType.Note),
        publication: null,
      })),
      trpcMsw.note.readResourcePublication.query(() => undefined),
    );
    return useResourceStore();
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    setRouteId(resourceId);
    readResourceQuery = vi.fn<(options: { input: { id: string } }) => ReadResourceResult>(({ input }) => ({
      ...createResource(input.id),
      publication: null,
    }));
    saveResourceContent = vi.fn<() => Resource>(() => ({ ...createResource(resourceId), contentVersion: 1 }));
    server.use(
      trpcMsw.resource.readResource.query(readResourceQuery),
      trpcMsw.sheet.readResourceContent.query(() => createDefaultSheetResource()),
      trpcMsw.sheet.saveResourceContent.mutation(saveResourceContent),
    );
  });

  // `readResource()` swaps the loaded resource an await before the content store re-seeds its content ref from
  // `readContent`, so a debounced autosave landing in between holds the previous resource's document — writing
  // It replaces this resource's content with another one's, under this one's id and contentVersion
  test("refuses a save while the content in hand still belongs to the previous resource", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    setRouteId(otherResourceId);
    await readResource();
    const isSuccessful = await saveContent(createDefaultSheetResource());

    expect(isSuccessful).toBe(false);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("saves once the content has been read for the resource that is loaded", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    setRouteId(otherResourceId);
    await readResource();
    await readContent();
    const isSuccessful = await saveContent(createDefaultSheetResource());

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });

  // The signal is armed by the keystroke and cleared by the write, and every door into a write is this one — a
  // Settings dialog saving directly arms nothing, so a door that cleared its own would leave the toolbar at
  // Saving for an edit the server already has. A save with nothing left to write is a save all the same
  test("clears the unwritten-edit signal on a save with nothing to write", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { hasUnwrittenContent, saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
    await readResource();
    await readContent();
    setPersistedContent(createDefaultSheetResource());
    hasUnwrittenContent.value = true;
    const isSuccessful = await saveContent(createDefaultSheetResource());

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // Saves of different resources are different single-flight keys, so one settles after the blade has moved on.
  // The contentVersion it carries back is its own resource's, and merged into the loaded one it makes that one's
  // Next save carry a version the server never issued for it — which comes back as a stale rejection
  test("leaves the loaded resource alone when a save settles for another", async () => {
    expect.hasAssertions();

    const { promise: isNavigated, resolve: resolveNavigated } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
        await isNavigated;
        return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    const save = saveContent(createDefaultSheetResource());
    setRouteId(otherResourceId);
    await readResource();
    await readContent();
    resolveNavigated();

    await expect(save).resolves.toBe(true);
    expect(resource.value?.id).toBe(otherResourceId);
    expect(resource.value?.contentVersion).toBe(0);
  });

  // Content saves are keyed by the resource they write, so one issued before the blade moved on is still in
  // Flight under its own key. Read in aggregate it makes the resource that is loaded now say it is saving work
  // That is not its own — and the toolbar it feeds is what the owner reads to know their edits are safe
  test("reports the loaded resource as saved while another resource's save is still in flight", async () => {
    expect.hasAssertions();

    const { promise: isNavigated, resolve: resolveNavigated } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
        await isNavigated;
        return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    const save = saveContent(createDefaultSheetResource());
    setRouteId(otherResourceId);
    await readResource();
    await readContent();

    expect(saveState.value).toBe(ResourceSaveState.Saved);

    resolveNavigated();
    await save;
  });

  // Autosave fires again while the previous save is still in flight, and the row is read when the write is sent
  // Rather than when it was issued — sending the version it was holding makes the server reject our own
  // Overlapping save as a cross-session edit and strand the blade behind a refresh prompt
  test("carries the contentVersion the save ahead of it wrote back", async () => {
    expect.hasAssertions();

    const contentVersions: number[] = [];
    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(({ input }) => {
        contentVersions.push(input.contentVersion);
        return { ...createResource(resourceId), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    await Promise.all([saveContent(createDefaultSheetResource()), saveContent(createDefaultSheetResource())]);

    expect(contentVersions).toStrictEqual([0, 1]);
  });

  // The notification that reports a failed save is a one-shot the owner dismisses, so the state is what keeps
  // Saying their work is only in the tab
  test("reports a rejected save as not saved until one lands", async () => {
    expect.hasAssertions();

    let isSaveRejected = true;
    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(({ input }) => {
        if (isSaveRejected) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return { ...createResource(resourceId), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    await saveContent(createDefaultSheetResource());

    expect(saveState.value).toBe(ResourceSaveState.Failed);

    isSaveRejected = false;
    await saveContent(createDefaultSheetResource());

    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // Every retry after a stale rejection is a guaranteed rejection, so the state latches: the remedy is a reload,
  // Not waiting, and the owner has to be able to see that after the warning is gone
  test("reports a stale save as out of date until the next read", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: staleContentVersionErrorMessage });
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent();
    await saveContent(createDefaultSheetResource());

    expect(saveState.value).toBe(ResourceSaveState.Stale);

    await readResource();

    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // Renames of one resource queue, so the second's rollback has to restore the name the rename ahead of it
  // Stored — the name it read when it was issued predates that one, and leaves a name the server never accepted
  // On the blade until the next load
  test("rolls a failed rename back to the rename ahead of it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.sheet.updateResource.mutation(({ input }) => {
        if (input.name === failingName) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return { ...createResource(resourceId), name: input.name ?? "" };
      }),
    );
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readResource, renameResource } = resourceStore;
    await readResource();
    await Promise.all([renameResource(newName), renameResource(failingName)]);

    expect(resource.value?.name).toBe(newName);
  });

  // A tag edit keeps its own executor because it owns fields the rename does not, which only holds if the write
  // Carries nothing but the tags — restating the name would make a tag edit overlapping a rename put the
  // Pre-rename name back on the server while the blade goes on showing the new one
  test("sends only the field each metadata write owns", async () => {
    expect.hasAssertions();

    const updateInputs: Partial<Pick<Resource, "name" | "tags">>[] = [];
    server.use(
      trpcMsw.sheet.updateResource.mutation(({ input }) => {
        updateInputs.push({ name: input.name, tags: input.tags });
        return createResource(resourceId);
      }),
    );
    const resourceStore = useResourceStore();
    const { readResource, renameResource, updateResourceTags } = resourceStore;
    await readResource();
    await Promise.all([renameResource(newName), updateResourceTags(tags)]);

    expect(updateInputs).toStrictEqual([
      { name: newName, tags: undefined },
      { name: undefined, tags },
    ]);
  });

  // A second unpublish queues behind the first and finds nothing left to withdraw, so its rejection restores
  // Nothing — the publication it read when it was issued is the one the first unpublish already removed, and
  // Putting it back offers a public link the server no longer serves
  test("rolls a failed unpublish back to the unpublish ahead of it", async () => {
    expect.hasAssertions();

    let isFailing = false;
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { readResource, unpublishResource } = resourceStore;
    server.use(
      trpcMsw.note.readResourcePublication.query(() => publication),
      trpcMsw.note.unpublishResource.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        isFailing = true;
        return createResource(resourceId, ResourceType.Note);
      }),
    );
    await readResource();
    await Promise.all([unpublishResource(), unpublishResource()]);

    expect(loadedPublication.value).toBeUndefined();
  });

  // Publishing and unpublishing end the same publication row, so they run one after the other. On separate
  // Executors they overlap: the unpublish captures the publication before the publish has created it, and its
  // Rejection then rolls back to nothing — leaving a resource the server has published showing as a draft
  test("queues an unpublish behind the publish it shares an executor with", async () => {
    expect.hasAssertions();

    const { promise: publishHandled, resolve: resolvePublishHandled } = Promise.withResolvers<void>();
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { publishResource, readResource, unpublishResource } = resourceStore;
    server.use(
      trpcMsw.note.publishResource.mutation(() => {
        resolvePublishHandled();
        return publication;
      }),
      // Answered only once the publish has been, so the ordering under test is the store's own rather than
      // Whichever response the network happened to deliver first
      trpcMsw.note.unpublishResource.mutation(async () => {
        await publishHandled;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    await readResource();
    await Promise.all([publishResource(), unpublishResource()]);

    expect(loadedPublication.value).toStrictEqual(publication);
  });

  // The dispatch is the loaded row's own type, so the content read has to follow the type the route named
  // Rather than whichever router the calling store happens to be written against
  test("reads content through the loaded type's own router", async () => {
    expect.hasAssertions();

    const readResourceContent = vi.fn<() => NoteResource>(() => ({ doc: EMPTY_NOTE_DOC }));
    const resourceStore = setupNoteResource();
    const { readContent, readResource } = resourceStore;
    server.use(trpcMsw.note.readResourceContent.query(readResourceContent));
    await readResource();
    const content = await readContent();

    expect(readResourceContent).toHaveBeenCalledTimes(1);
    expect(content).toStrictEqual({ doc: EMPTY_NOTE_DOC });
  });

  // The capability is what makes readResourcePublication reachable, so a publishable type that never loads its
  // Publication renders an unpublish button as a publish one, and the public link is lost
  // The publication rides the resource read, so loading one is a single round trip — the targeted re-read is
  // Still there for publish and unpublish, and calling it here would only re-resolve ownership already resolved
  test("takes the publication from the resource read rather than a second call", async () => {
    expect.hasAssertions();

    const readResourcePublication = vi.fn<() => ResourcePublication>(() => publication);
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { readResource } = resourceStore;
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id, ResourceType.Note),
        publication,
      })),
      trpcMsw.note.readResourcePublication.query(readResourcePublication),
    );
    await readResource();

    expect(readResourcePublication).not.toHaveBeenCalled();
    expect(loadedPublication.value).toStrictEqual(publication);
  });

  // `null` is the read's answer for a resource that has no publication — an unpublished one, or a type that
  // Cannot publish at all. It becomes `undefined` here, which is the ref's own "nothing loaded"
  test("reads an absent publication as undefined", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { readResource } = resourceStore;
    await readResource();

    expect(loadedPublication.value).toBeUndefined();
  });

  test("publishes and unpublishes through the loaded type's own router", async () => {
    expect.hasAssertions();

    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { publishResource, readResource, unpublishResource } = resourceStore;
    server.use(
      trpcMsw.note.publishResource.mutation(() => publication),
      trpcMsw.note.unpublishResource.mutation(() => createResource(resourceId, ResourceType.Note)),
    );
    await readResource();
    await publishResource();

    expect(loadedPublication.value).toStrictEqual(publication);

    await unpublishResource();

    expect(loadedPublication.value).toBeUndefined();
  });

  // The store is app-lifetime and this state is one blade's, so the page that opened the resource takes it
  // Back down again rather than leaving the next blade to render the previous resource's name
  test("takes the blade's state down with the page that opened it", async () => {
    expect.hasAssertions();

    const resourceStore = setupNoteResource();
    const { publication: loadedPublication, resource } = storeToRefs(resourceStore);
    const { clearResource, readResource } = resourceStore;
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id, ResourceType.Note),
        publication,
      })),
    );
    await readResource();
    clearResource(resourceId);

    expect(resource.value).toBeUndefined();
    expect(loadedPublication.value).toBeUndefined();
  });

  // A keyed page swap mounts the next resource's page before the previous one unmounts, so an unconditional
  // Teardown would blank the resource the page that replaced it has already loaded
  test("leaves state the next resource's page already loaded alone", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { clearResource, readResource } = resourceStore;
    await readResource();
    setRouteId(otherResourceId);
    await readResource();
    clearResource(resourceId);

    expect(resource.value?.id).toBe(otherResourceId);
  });

  // A list view names no resource, and a read racing the navigation onto one resolves the route after it has
  // Left the blade — the empty sentinel would reach the server as a uuid input that fails validation
  test("issues no read when the route names no resource", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { isPending, resource } = storeToRefs(resourceStore);
    const { readResource } = resourceStore;
    setRouteId("");
    await readResource();

    expect(readResourceQuery).not.toHaveBeenCalled();
    expect(resource.value).toBeUndefined();
    expect(isPending.value).toBe(false);
  });
});
