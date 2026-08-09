// @vitest-environment nuxt
import type { NoteResource } from "#shared/models/resource/note/NoteResource";
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useResource, () => {
  const server = setupMswTrpc();
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
  const newName = "newName";
  const failingName = "failingName";
  // Sheet is not publishable and Note is, so the pair covers both sides of every capability gate below
  const createResource = (id: string, type = ResourceType.Sheet) => createResourceListItem({ id, type });
  const publication = {
    publishedAt: new Date(0),
    publishVersion: 1,
    resourceId,
  } as ResourcePublication;
  // A Note loads its publication on the way in, so the unpublished answer is the baseline a test overrides
  const useNoteResource = () => {
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id, ResourceType.Note),
        publication: null,
      })),
      trpcMsw.note.readResourcePublication.query(() => undefined),
    );
    return useResource<ResourceType.Note>(ref(resourceId));
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    saveResourceContent = vi.fn<() => Resource>(() => ({ ...createResource(resourceId), contentVersion: 1 }));
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({ ...createResource(input.id), publication: null })),
      trpcMsw.sheet.readResourceContent.query(() => createDefaultSheetResource()),
      trpcMsw.sheet.saveResourceContent.mutation(saveResourceContent),
    );
  });

  // `load()` swaps the loaded resource an await before the store re-seeds its content ref from `readContent`,
  // So a debounced autosave landing in between holds the previous resource's document — writing it replaces
  // This resource's content with another one's, under this one's id and contentVersion
  test("refuses a save while the content in hand still belongs to the previous resource", async () => {
    expect.hasAssertions();

    const id = ref(resourceId);
    const { load, readContent, save } = useResource(id);
    await load();
    await readContent();
    id.value = otherResourceId;
    await load();
    const isSuccessful = await save(createDefaultSheetResource());

    expect(isSuccessful).toBe(false);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("saves once the content has been read for the resource that is loaded", async () => {
    expect.hasAssertions();

    const id = ref(resourceId);
    const { load, readContent, save } = useResource(id);
    await load();
    await readContent();
    id.value = otherResourceId;
    await load();
    await readContent();
    const isSuccessful = await save(createDefaultSheetResource());

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
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
    const { load, readContent, save } = useResource(ref(resourceId));
    await load();
    await readContent();
    await Promise.all([save(createDefaultSheetResource()), save(createDefaultSheetResource())]);

    expect(contentVersions).toStrictEqual([0, 1]);
  });

  // Renames of one resource queue, so the second's rollback has to restore the name the rename ahead of it
  // Stored — the name it read when it was issued predates that one, and leaves a name the server never accepted
  // On the blade until the next load
  test("rolls a failed rename back to the rename ahead of it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.sheet.updateResource.mutation(({ input }) => {
        if (input.name === failingName) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return { ...createResource(resourceId), name: input.name };
      }),
    );
    const { load, rename, resource } = useResource(ref(resourceId));
    await load();
    await Promise.all([rename(newName), rename(failingName)]);

    expect(resource.value?.name).toBe(newName);
  });

  // A second unpublish queues behind the first and finds nothing left to withdraw, so its rejection restores
  // Nothing — the publication it read when it was issued is the one the first unpublish already removed, and
  // Putting it back offers a public link the server no longer serves
  test("rolls a failed unpublish back to the unpublish ahead of it", async () => {
    expect.hasAssertions();

    let isFailing = false;
    const { load, publication: loadedPublication, unpublish } = useNoteResource();
    server.use(
      trpcMsw.note.readResourcePublication.query(() => publication),
      trpcMsw.note.unpublishResource.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        isFailing = true;
        return createResource(resourceId, ResourceType.Note);
      }),
    );
    await load();
    await Promise.all([unpublish(), unpublish()]);

    expect(loadedPublication.value).toBeUndefined();
  });

  // The dispatch is the loaded row's own type, so the content read has to follow the type the route named
  // Rather than whichever router the calling store happens to be written against
  test("reads content through the loaded type's own router", async () => {
    expect.hasAssertions();

    const readResourceContent = vi.fn<() => NoteResource>(() => ({ doc: EMPTY_NOTE_DOC }));
    const { load, readContent } = useNoteResource();
    server.use(trpcMsw.note.readResourceContent.query(readResourceContent));
    await load();
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
    const { load, publication: loadedPublication } = useNoteResource();
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id, ResourceType.Note),
        publication,
      })),
      trpcMsw.note.readResourcePublication.query(readResourcePublication),
    );
    await load();

    expect(readResourcePublication).not.toHaveBeenCalled();
    expect(loadedPublication.value).toStrictEqual(publication);
  });

  // `null` is the read's answer for a resource that has no publication — an unpublished one, or a type that
  // Cannot publish at all. It becomes `undefined` here, which is the ref's own "nothing loaded"
  test("reads an absent publication as undefined", async () => {
    expect.hasAssertions();

    const { load, publication: loadedPublication, publish, unpublish } = useResource(ref(resourceId));
    await load();
    await publish();
    await unpublish();

    expect(loadedPublication.value).toBeUndefined();
  });

  test("publishes and unpublishes through the loaded type's own router", async () => {
    expect.hasAssertions();

    const { load, publication: loadedPublication, publish, unpublish } = useNoteResource();
    server.use(
      trpcMsw.note.publishResource.mutation(() => publication),
      trpcMsw.note.unpublishResource.mutation(() => createResource(resourceId, ResourceType.Note)),
    );
    await load();
    await publish();

    expect(loadedPublication.value).toStrictEqual(publication);

    await unpublish();

    expect(loadedPublication.value).toBeUndefined();
  });
});
