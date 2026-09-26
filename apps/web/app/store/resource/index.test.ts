// @vitest-environment nuxt
import type { NoteResource } from "#shared/models/resource/note/NoteResource";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import {
  CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE,
  EMPTY_NOTE_DOC,
  MAX_RESOURCE_CONTENT_SIZE,
  STALE_CONTENT_VERSION_ERROR_MESSAGE,
} from "#shared/services/resource/constants";
import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { ResourceContentHookMap } from "@/services/resource/ResourceContentHookMap";
import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { noop, takeOne, withFinalizerAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { getMockSasUrl } from "azure-mock";
import { http, HttpResponse } from "msw";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

// A worker has no place in the test environment, and what it encodes is the generated module's own test to prove
vi.mock(import("@/services/resource/encodeContentDelta"), () => ({
  encodeContentDelta: () => Promise.resolve(new Uint8Array(1)),
}));
// Sheet is not publishable and Note is, so the pair covers both sides of every capability gate below
const createResource = (id: string, type = ResourceType.Sheet) => createResourceListItem({ id, type });
// The unpublished answer the read carries, which is what a publishable type's test overrides
type ReadResourceResult = ReturnType<typeof createResource> & { publication: null };
// The route is what the store loads from, so switching resources in a test is switching the route
const setRouteId = (id: string) => {
  useRouter().currentRoute.value.params.id = id;
};
// A document over the request limit, so every save of it takes the delta or the staged path
const createLargeSheetResource = (name: string) => {
  const content = createDefaultSheetResource();
  content.data.metadata.name = name.padEnd(MAX_REQUEST_SIZE);
  return content;
};

// A document over the request limit, so every save of it takes the delta or the staged path
const createLargeSheetResource = (name: string) => {
  const content = createDefaultSheetResource();
  content.data.metadata.name = name.padEnd(MAX_REQUEST_SIZE);
  return content;
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
  const tags: ResourceTags = { "": "" };
  const publication = { publishedAt: new Date(0), publishVersion: 1, resourceId } as ResourcePublication;
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

  // The staged transport answered at the network: the write target, the PUT to it, and the commit's row, which
  // Carries the hash of what it stored
  const setupStagedSave = (contentHash = "") => {
    const sasUrl = getMockSasUrl(`${window.location.origin}/${resourceId}`, "w", "b");
    const generateUploadContentSasUrl = vi.fn<(options: { input: { id: string; size: number } }) => string>(
      () => sasUrl,
    );
    const saveStagedResourceContent = vi.fn<
      (options: { input: { contentVersion: number; hash: string; id: string } }) => Resource
    >(() => ({ ...createResource(resourceId), contentHash, contentVersion: 1 }));
    server.use(
      http.put(`${window.location.origin}/${resourceId}`, () => new HttpResponse()),
      trpcMsw.sheet.generateUploadContentSasUrl.query(generateUploadContentSasUrl),
      trpcMsw.sheet.saveStagedResourceContent.mutation(saveStagedResourceContent),
    );
    return { generateUploadContentSasUrl, saveStagedResourceContent };
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
    await readContent(noop);
    setRouteId(otherResourceId);
    await readResource();
    const isSuccessful = await saveContent(createDefaultSheetResource());

    expect(isSuccessful).toBe(false);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // A content store that never read holds its empty default, so writing it would blank the stored document
  test("refuses a save before any content has been read", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readResource, saveContent } = resourceStore;
    await readResource();
    const isSuccessful = await saveContent(createDefaultSheetResource());

    expect(isSuccessful).toBe(false);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // A navigation between two resources leaves the first one's read in flight, and landing last it would put the
  // Resource the reader left under the page for the one they opened
  test("keeps the resource the route names when an earlier read lands last", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.resource.readResource.query(async ({ input }) => {
        if (input.id === resourceId) await readGate;
        return { ...createResource(input.id), publication: null };
      }),
    );
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readResource } = resourceStore;
    const pendingRead = readResource();
    setRouteId(otherResourceId);
    await readResource();
    releaseRead();
    await pendingRead;

    expect(resource.value?.id).toBe(otherResourceId);
  });

  // A content store holds one document, so a content read that lands after the blade moved on would put the
  // Resource left behind on screen under the one opened — and claiming it as read would refuse that one's saves
  test("hands a content read that lands after a switch to nobody", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.sheet.readResourceContent.query(async ({ input }) => {
        if (input.id === resourceId) await readGate;
        return createDefaultSheetResource();
      }),
    );
    const resourceStore = useResourceStore();
    const { checkIsContentRead, readContent, readResource } = resourceStore;
    const applyContent = vi.fn<() => void>();
    await readResource();
    const pendingRead = readContent(applyContent);
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);
    releaseRead();
    await pendingRead;

    expect(applyContent).not.toHaveBeenCalled();
    expect(checkIsContentRead()).toBe(true);
  });

  test("saves once the content has been read for the resource that is loaded", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);
    const isSuccessful = await saveContent(createDefaultSheetResource());

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });

  // A registered class crosses the wire as an escaped string with an entry of its own in the metadata, so a Sheet's
  // Rows outgrow the limit well before their JSON does — sent inline, that body is the reset this path exists for
  test.each<[string, (content: SheetResource) => void]>([
    [
      "its document",
      (content) => {
        content.data.metadata.name = " ".repeat(MAX_REQUEST_SIZE);
      },
    ],
    [
      "only its transformer envelope",
      (content) => {
        content.data.rows = Array.from({ length: 10_000 }, () => new Row());
      },
    ],
  ])("stages a save when %s is over the request limit and commits it by its hash", async (_title, enlarge) => {
    expect.hasAssertions();

    const { generateUploadContentSasUrl, saveStagedResourceContent } = setupStagedSave();
    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    const content = createDefaultSheetResource();
    enlarge(content);
    const isSuccessful = await saveContent(content);
    const { input } = takeOne(saveStagedResourceContent.mock.calls, 0)[0];

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(takeOne(generateUploadContentSasUrl.mock.calls, 0)[0].input.size).toBeLessThan(MAX_REQUEST_SIZE);
    expect(input).toStrictEqual({ contentVersion: 0, hash: expect.stringMatching(/^[\da-f]{64}$/u), id: resourceId });
  });

  test("saves a large document as a delta against the bytes the server confirmed storing", async () => {
    expect.hasAssertions();

    const firstContent = createLargeSheetResource(" ");
    const contentHash = await getSha256Hex(new TextEncoder().encode(JSON.stringify(firstContent)));
    const { saveStagedResourceContent } = setupStagedSave(contentHash);
    const saveResourceContentDelta = vi.fn<
      (options: { input: { baselineHash: string; contentVersion: number; delta: string; id: string } }) => Resource
    >(() => ({ ...createResource(resourceId), contentVersion: 2 }));
    server.use(trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta));
    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    await saveContent(firstContent);
    await saveContent(createLargeSheetResource("a"));
    const { input } = takeOne(saveResourceContentDelta.mock.calls, 0)[0];

    expect(saveStagedResourceContent).toHaveBeenCalledTimes(1);
    expect(input).toStrictEqual({
      baselineHash: contentHash,
      contentVersion: 1,
      delta: new Uint8Array(1).toBase64(),
      id: resourceId,
    });
  });

  // A document one body cannot carry is read from Blob Storage rather than through the server, and the bytes read
  // Are the stored ones, so a session's first large save needs no full save to earn a baseline
  test("reads a large document from Blob Storage and saves its first edit as a delta against those bytes", async () => {
    expect.hasAssertions();

    const loadedContent = createLargeSheetResource(" ");
    const loadedContentBytes = new TextEncoder().encode(JSON.stringify(loadedContent));
    const contentHash = await getSha256Hex(loadedContentBytes);
    const sasUrl = getMockSasUrl(`${window.location.origin}/${resourceId}`, "r", "b");
    const saveResourceContentDelta = vi.fn<
      (options: { input: { baselineHash: string; contentVersion: number; delta: string; id: string } }) => Resource
    >(() => createResource(resourceId));
    server.use(
      http.get(`${window.location.origin}/${resourceId}`, () => new HttpResponse(loadedContentBytes)),
      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id),
        contentSize: loadedContentBytes.byteLength,
        publication: null,
      })),
      trpcMsw.sheet.generateReadContentSasUrl.query(() => sasUrl),
      trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta),
    );
    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    const applyContent = vi.fn<(content: ResourceContent<ResourceType.Sheet> | undefined) => void>();
    await readResource();
    await readContent<ResourceType.Sheet>(applyContent);
    await saveContent(createLargeSheetResource("a"));

    expect(takeOne(applyContent.mock.calls, 0)[0]?.data.metadata.name).toBe(loadedContent.data.metadata.name);
    expect(takeOne(saveResourceContentDelta.mock.calls, 0)[0].input.baselineHash).toBe(contentHash);
  });

  // Another device's save, a restore or a deploy moved the stored bytes, and the owner is told nothing
  test("saves in full when the server refuses a delta against a moved baseline", async () => {
    expect.hasAssertions();

    const firstContent = createLargeSheetResource(" ");
    const contentHash = await getSha256Hex(new TextEncoder().encode(JSON.stringify(firstContent)));
    const { saveStagedResourceContent } = setupStagedSave(contentHash);
    server.use(
      trpcMsw.sheet.saveResourceContentDelta.mutation(() => {
        throw new TRPCError({ code: "CONFLICT", message: CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE });
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    await saveContent(firstContent);
    const isSuccessful = await saveContent(createLargeSheetResource("a"));

    expect(isSuccessful).toBe(true);
    expect(saveStagedResourceContent).toHaveBeenCalledTimes(2);
    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // A content schema's transforms can make the stored serialization differ from the one sent, and a delta against
  // Bytes the server does not hold could never apply
  test("keeps no baseline when the stored bytes' hash is not the sent bytes'", async () => {
    expect.hasAssertions();

    const { saveStagedResourceContent } = setupStagedSave();
    const saveResourceContentDelta = vi.fn<() => Resource>(() => createResource(resourceId));
    server.use(trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta));
    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    await saveContent(createLargeSheetResource(" "));
    await saveContent(createLargeSheetResource("a"));

    expect(saveResourceContentDelta).not.toHaveBeenCalled();
    expect(saveStagedResourceContent).toHaveBeenCalledTimes(2);
  });

  test("refuses a save over the content limit with a notification and no request", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    const notificationStore = useNotificationStore();
    const { notifications } = storeToRefs(notificationStore);
    await readResource();
    await readContent(noop);
    const content = createDefaultSheetResource();
    content.data.metadata.name = " ".repeat(MAX_RESOURCE_CONTENT_SIZE);
    const isSuccessful = await saveContent(content);

    expect(isSuccessful).toBe(false);
    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(notifications.value).toHaveLength(1);
    expect(saveState.value).toBe(ResourceSaveState.Failed);
  });

  test("skips a save with nothing new since the one it wrote", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    const content = createDefaultSheetResource();
    await saveContent(content);
    await saveContent(content);

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
    await readContent(noop);
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

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
        await navigatedPromise;
        return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    const save = saveContent(createDefaultSheetResource());
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);
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

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
        await navigatedPromise;
        return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
    const save = saveContent(createDefaultSheetResource());
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);

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
    await readContent(noop);
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
        if (isSaveRejected) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

        return { ...createResource(resourceId), contentVersion: input.contentVersion + 1 };
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
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
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
      }),
    );
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, readResource, saveContent } = resourceStore;
    await readResource();
    await readContent(noop);
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
        if (input.name === failingName) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

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

  // The page's delete asks nothing first, so the toast it leaves is the only way back without a trip to the bin
  test("leaves a single-use restore on the toast a delete raises", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.sheet.deleteResource.mutation(() => createResource(resourceId)));
    const resourceStore = useResourceStore();
    const { deleteResource, readResource } = resourceStore;
    const notificationStore = useNotificationStore();
    const { notifications } = storeToRefs(notificationStore);
    await readResource();
    const isDeleted = await deleteResource();

    expect(isDeleted).toBe(true);
    const { action } = takeOne(notifications.value);
    assert.exists(action);
    const { handler, ...restAction } = action;

    expect(handler).toBeTypeOf("function");
    expect(restAction).toStrictEqual({ isSingleUse: true, title: "Restore" });
  });

  // A metadata write is keyed by the resource it targets, not by the blade, so one settles after the blade has
  // Moved on — the name it carries back is its own resource's, and merged into the loaded one it renames it
  test("leaves the loaded resource alone when a rename settles for another", async () => {
    expect.hasAssertions();

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.sheet.updateResource.mutation(async ({ input }) => {
        await navigatedPromise;
        return { ...createResource(input.id), name: input.name ?? "" };
      }),
    );
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readResource, renameResource } = resourceStore;
    await readResource();
    const rename = renameResource(newName);
    setRouteId(otherResourceId);
    await readResource();
    const { name } = createResource(otherResourceId);
    resolveNavigated();
    await rename;

    expect(resource.value?.id).toBe(otherResourceId);
    expect(resource.value?.name).toBe(name);
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
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

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
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }),
    );
    await readResource();
    await Promise.all([publishResource(), unpublishResource()]);

    expect(loadedPublication.value).toStrictEqual(publication);
  });

  // The publication a publish carries back is its own resource's, so one settling after the blade has moved on
  // Would show the loaded resource as published, complete with a public link the server does not serve
  test("leaves the loaded publication alone when a publish settles for another resource", async () => {
    expect.hasAssertions();

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { publishResource, readResource } = resourceStore;
    server.use(
      trpcMsw.note.publishResource.mutation(async () => {
        await navigatedPromise;
        return publication;
      }),
    );
    await readResource();
    const publish = publishResource();
    setRouteId(otherResourceId);
    await readResource();
    resolveNavigated();
    await publish;

    expect(loadedPublication.value).toBeUndefined();
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
    const applyContent = vi.fn<(content?: unknown) => void>();
    await readContent(applyContent);

    expect(readResourceContent).toHaveBeenCalledTimes(1);
    expect(applyContent).toHaveBeenCalledExactlyOnceWith({ doc: EMPTY_NOTE_DOC });
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

  // A third-party editor adopts the content the store's re-read landed, so the two stages run in order rather
  // Than together — the reload hook resolves a microtask late, which a single stage would let the adopt beat
  test("reloads the content before the editors adopt it", async () => {
    expect.hasAssertions();

    const stages: string[] = [];
    const resourceStore = useResourceStore();
    const { reloadResourceContent } = resourceStore;
    const unregisterReload = ResourceContentHookMap.Reload.register(async () => {
      await Promise.resolve();
      stages.push("reload");
    });
    const unregisterAdopt = ResourceContentHookMap.Adopt.register(() => {
      stages.push("adopt");
    });
    await withFinalizerAsync(
      () => reloadResourceContent(),
      () => {
        unregisterReload();
        unregisterAdopt();
      },
    );

    expect(stages).toStrictEqual(["reload", "adopt"]);
  });
});
