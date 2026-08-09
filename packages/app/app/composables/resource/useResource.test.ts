// @vitest-environment nuxt
import type { NoteResource } from "#shared/models/resource/note/NoteResource";
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useResource, () => {
  const server = setupMswTrpc();
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
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
      trpcMsw.resource.readResource.query(({ input }) => createResource(input.id, ResourceType.Note)),
      trpcMsw.note.readResourcePublication.query(() => undefined),
    );
    return useResource<ResourceType.Note>(ref(resourceId));
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    saveResourceContent = vi.fn<() => Resource>(() => ({ ...createResource(resourceId), contentVersion: 1 }));
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => createResource(input.id)),
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
  test("loads the publication for a publishable type", async () => {
    expect.hasAssertions();

    const readResourcePublication = vi.fn<() => ResourcePublication>(() => publication);
    const { load, publication: loadedPublication } = useNoteResource();
    server.use(trpcMsw.note.readResourcePublication.query(readResourcePublication));
    await load();

    expect(readResourcePublication).toHaveBeenCalledTimes(1);
    expect(loadedPublication.value).toStrictEqual(publication);
  });

  // A type with no publish procedures has nothing to read, and the guard is the only thing standing between
  // The loader and a call to `undefined` — dropping it throws out of `load()` for over half the types
  test("leaves the publication unread for a type without the capability", async () => {
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
