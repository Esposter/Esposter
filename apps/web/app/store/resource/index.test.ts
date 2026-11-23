// @vitest-environment nuxt
import type { NoteResource } from "#shared/models/resource/note/NoteResource";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { uploadFileToUrl } from "#src/services/file/uploadFileToUrl";
import type { ResourceInResource, ResourcePublicationInResource, ResourceTags } from "@esposter/db-schema";
import type { UndefinedOnPartial } from "type-fest";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import {
  CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE,
  EMPTY_NOTE_DOC,
  MAX_RESOURCE_CONTENT_SIZE,
  STALE_CONTENT_VERSION_ERROR_MESSAGE,
} from "#shared/services/resource/constants";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { createDefaultSheetResource } from "#shared/services/resource/sheet/createDefaultSheetResource";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useDeleteRows } from "#src/composables/resource/sheet/commands/useDeleteRows";
import { useReadOpenResource } from "#src/composables/resource/useReadOpenResource";
import { ResourceSaveState } from "#src/models/resource/ResourceSaveState";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { ResourceContentHookMap } from "#src/services/resource/ResourceContentHookMap";
import { getSha256Hex } from "#src/services/shared/getSha256Hex";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { useResourceStore } from "#src/store/resource/index";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { ResourceType } from "@esposter/db-schema";
import { ASSET_HASH_REGEX, noop, takeOne, waitForSynchronizedFunctions, withFinalizerAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { http, HttpResponse } from "msw";
import { v7 } from "uuid";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

// A worker has no place in the test environment, and what it encodes is the generated module's own test to prove
vi.mock(import("#src/services/resource/encodeContentDelta"), () => ({
  encodeContentDelta: () => Promise.resolve(new Uint8Array(1)),
}));
// The write is an XMLHttpRequest, which the test environment does not answer at the network the way fetch is. The staged
// Path's own steps are what these tests hold, so the PUT is a stored success rather than a request
const { uploadFileToUrlMock } = vi.hoisted(() => ({
  uploadFileToUrlMock: vi.fn<typeof uploadFileToUrl>(() => Promise.resolve()),
}));
vi.mock(import("#src/services/file/uploadFileToUrl"), () => ({ uploadFileToUrl: uploadFileToUrlMock }));
// Sheet is not publishable and Note is, so the pair covers both sides of every capability gate below
const createResource = (id: string, type: ResourceType = ResourceType.Sheet) => createResourceListItem({ id, type });
// The unpublished answer the read carries, which is what a publishable type's test overrides
type ReadResourceResult = { favorite: null; publication: null } & ReturnType<typeof createResource>;
// The route is what the store loads from, so switching resources in a test is switching the route
const setRouteId = (id: string) => {
  Object.assign(useRouter().currentRoute.value.params, { id });
};
// A document over the request limit, so every save of it takes the delta or the staged path
const createLargeSheetResource = (name: string) => {
  const content = createDefaultSheetResource();
  content.data.metadata.name = name.padEnd(MAX_REQUEST_SIZE);
  return content;
};

// A save's state reads Saving until the write it issued is answered. The write floats with every other fire-and-forget,
// So the drain is the sign it has landed, and the state it settled in is what a save reports now that a call returns
// Nothing
const settleSave = async () => {
  await waitForSynchronizedFunctions();
  const resourceStore = useResourceStore();
  const { saveState } = storeToRefs(resourceStore);
  return saveState.value;
};

describe(useResourceStore, () => {
  const { server, trpcMsw } = setupMswTrpc();
  // Held as a spy rather than an inline resolver, so a test can assert the read was never issued at all
  let readResourceQuery: ReturnType<typeof vi.fn<(options: { input: { id: string } }) => ReadResourceResult>>;
  let saveResourceContent: ReturnType<typeof vi.fn<() => ResourceInResource>>;
  const resourceId = v7();
  const otherResourceId = v7();
  const newName = "newName";
  const failingName = "failingName";
  const tags: ResourceTags = { a: "" };
  // A server row carries its tombstone flag and its version, which the store reads a publication by
  const publication = {
    deletedAt: null,
    publishedAt: new Date(0),
    publishVersion: 1,
    resourceId,
    version: 0,
  } as ResourcePublicationInResource;
  // A Note loads its publication on the way in, so the unpublished answer is the baseline a test overrides
  const setupNoteResource = () => {
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id, ResourceType.Note),
      favorite: null,
      publication: null,
    }));
    trpcMsw.note.readResourcePublication.query(() => undefined);
    return useResourceStore();
  };

  // The staged transport answered at the network: the write target, the PUT to it, and the commit's row, which
  // Carries the hash of what it stored
  const setupStagedSave = (contentHash = "") => {
    const presignedUrl = `${window.location.origin}/${resourceId}`;
    const generateUploadContentPresignedUrl = vi.fn<(options: { input: { id: string; size: number } }) => string>(
      () => presignedUrl,
    );
    const saveStagedResourceContent = vi.fn<
      (options: { input: { contentVersion: number; hash: string; id: string } }) => ResourceInResource
    >(() => ({ ...createResource(resourceId), contentHash, contentVersion: 1 }));
    trpcMsw.sheet.generateUploadContentPresignedUrl.query(generateUploadContentPresignedUrl);
    trpcMsw.sheet.saveStagedResourceContent.mutation(saveStagedResourceContent);
    return { generateUploadContentPresignedUrl, saveStagedResourceContent };
  };

  // A write for a resource that is no longer the loaded one has no state to wait on, so the wait is for its request to be
  // Answered: msw reports the request's end, and the client applies the answer once the promises it chained have run
  const settleRequest = async () => {
    await new Promise<void>((resolve) => {
      const onRequestEnd = () => {
        server.events.removeListener("request:end", onRequestEnd);
        resolve();
      };
      server.events.on("request:end", onRequestEnd);
    });
    await flushPromises();
  };

  // The clock starts at the epoch, so a removal dated the epoch is still inside the tombstone retention
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    setRouteId(resourceId);
    readResourceQuery = vi.fn<(options: { input: { id: string } }) => ReadResourceResult>(({ input }) => ({
      ...createResource(input.id),
      favorite: null,
      publication: null,
    }));
    saveResourceContent = vi.fn<() => ResourceInResource>(() => ({ ...createResource(resourceId), contentVersion: 1 }));
    trpcMsw.resource.readResource.query(readResourceQuery);
    trpcMsw.sheet.readResourceContent.query(() => createDefaultSheetResource());
    trpcMsw.sheet.saveResourceContent.mutation(saveResourceContent);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The open resource's read is the store's, so its route guard is tested here once.
  // A route with no resource segment has nothing to read, and the caller's executor is never asked to issue one
  test("issues no read of the open resource while the route names no resource", async () => {
    expect.hasAssertions();

    setRouteId("");
    const resourceStore = useResourceStore();
    const { readOpenResource } = resourceStore;
    // A read that must never run.
    // A mock of the generic read itself loses its type parameter, so the store is handed a plain function over it
    const executeRead = vi.fn<() => never>();
    const runScope = effectScope().run(useRunScope);
    assert.exists(runScope);

    await readOpenResource(() => executeRead(), { key: resourceId, onRead: noop, runScope });

    expect(executeRead).not.toHaveBeenCalled();
  });

  // `readResource()` swaps the loaded resource an await before the content store re-seeds its content ref from
  // `readContent`, so a debounced autosave landing in between holds the previous resource's document.
  // Writing it replaces this resource's content with another one's, under this one's id and contentVersion
  test("refuses a save while the content in hand still belongs to the previous resource", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    setRouteId(otherResourceId);
    await readResource();
    saveContent(createDefaultSheetResource());

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // A content store that never read holds its empty default, so writing it would blank the stored document
  test("refuses a save before any content has been read", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    saveContent(createDefaultSheetResource());

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // A navigation between two resources leaves the first one's read in flight, and landing last it would put the
  // Resource the reader left under the page for the one they opened
  test("keeps the resource the route names when an earlier read lands last", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    trpcMsw.resource.readResource.query(async ({ input }) => {
      if (input.id === resourceId) {
        onReadReached();
        await readGate;
      }
      return { ...createResource(input.id), favorite: null, publication: null };
    });
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readResource } = useReadOpenResource();
    const pendingRead = readResource();
    // A read issued in the same tick would share the held one's batch and settle with it
    await isReadReached;
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
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    trpcMsw.sheet.readResourceContent.query(async ({ input }) => {
      if (input.id === resourceId) {
        onReadReached();
        await readGate;
      }
      return createDefaultSheetResource();
    });
    const resourceStore = useResourceStore();
    const { checkIsContentRead, readContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const applyContent = vi.fn<() => void>();
    await readResource();
    const pendingRead = readContent(applyContent);
    // Held the same way as the read above
    await isReadReached;
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
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    const settledState = await settleSave();

    expect(settledState).toBe(ResourceSaveState.Saved);
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
        content.data.rows = Array.from({ length: 12_000 }, () => new Row());
      },
    ],
  ])("stages a save when %s is over the request limit and commits it by its hash", async (_title, enlarge) => {
    expect.hasAssertions();

    const { generateUploadContentPresignedUrl, saveStagedResourceContent } = setupStagedSave();
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    const content = createDefaultSheetResource();
    enlarge(content);
    saveContent(content);
    const settledState = await settleSave();
    const { input } = takeOne(saveStagedResourceContent.mock.calls, 0)[0];

    expect(settledState).toBe(ResourceSaveState.Saved);
    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(takeOne(generateUploadContentPresignedUrl.mock.calls, 0)[0].input.size).toBeLessThan(MAX_REQUEST_SIZE);
    expect(input).toStrictEqual({ contentVersion: 0, hash: expect.stringMatching(ASSET_HASH_REGEX), id: resourceId });
  });

  test("saves a large document as a delta against the bytes the server confirmed storing", async () => {
    expect.hasAssertions();

    const firstContent = createLargeSheetResource(" ");
    const contentHash = await getSha256Hex(new TextEncoder().encode(JSON.stringify(firstContent)));
    const { saveStagedResourceContent } = setupStagedSave(contentHash);
    const saveResourceContentDelta = vi.fn<
      (options: {
        input: { baselineHash: string; contentVersion: number; delta: string; id: string };
      }) => ResourceInResource
    >(() => ({ ...createResource(resourceId), contentVersion: 2 }));
    trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta);
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(firstContent);
    await settleSave();
    saveContent(createLargeSheetResource("a"));
    await settleSave();
    const { input } = takeOne(saveResourceContentDelta.mock.calls, 0)[0];

    expect(saveStagedResourceContent).toHaveBeenCalledTimes(1);
    expect(input).toStrictEqual({
      baselineHash: contentHash,
      contentVersion: 1,
      delta: new Uint8Array(1).toBase64(),
      id: resourceId,
    });
  });

  // A document one body cannot carry is read from R2 rather than through the server, and the bytes read
  // Are the stored ones, so a session's first large save needs no full save to earn a baseline
  test("reads a large document from R2 and saves its first edit as a delta against those bytes", async () => {
    expect.hasAssertions();

    const loadedContent = createLargeSheetResource(" ");
    const loadedContentBytes = new TextEncoder().encode(JSON.stringify(loadedContent));
    const contentHash = await getSha256Hex(loadedContentBytes);
    const presignedUrl = `${window.location.origin}/${resourceId}`;
    const saveResourceContentDelta = vi.fn<
      (options: {
        input: { baselineHash: string; contentVersion: number; delta: string; id: string };
      }) => ResourceInResource
    >(() => createResource(resourceId));
    server.use(http.get(`${window.location.origin}/${resourceId}`, () => new HttpResponse(loadedContentBytes)));
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id),
      contentSize: loadedContentBytes.byteLength,
      favorite: null,
      publication: null,
    }));
    trpcMsw.sheet.generateReadContentPresignedUrl.query(() => presignedUrl);
    trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta);
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const applyContent = vi.fn<(content: ResourceContent<typeof ResourceType.Sheet> | undefined) => void>();
    await readResource();
    await readContent<typeof ResourceType.Sheet>(applyContent);
    saveContent(createLargeSheetResource("a"));
    await settleSave();

    expect(takeOne(applyContent.mock.calls, 0)[0]?.data.metadata.name).toBe(loadedContent.data.metadata.name);
    expect(takeOne(saveResourceContentDelta.mock.calls, 0)[0].input.baselineHash).toBe(contentHash);
  });

  // Another device's save, a restore or a deploy moved the stored bytes, and the owner is told nothing
  test("saves in full when the server refuses a delta against a moved baseline", async () => {
    expect.hasAssertions();

    const firstContent = createLargeSheetResource(" ");
    const contentHash = await getSha256Hex(new TextEncoder().encode(JSON.stringify(firstContent)));
    const { saveStagedResourceContent } = setupStagedSave(contentHash);
    trpcMsw.sheet.saveResourceContentDelta.mutation(() => {
      throw new TRPCError({ code: "CONFLICT", message: CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE });
    });
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(firstContent);
    await settleSave();
    saveContent(createLargeSheetResource("a"));
    await settleSave();

    expect(saveStagedResourceContent).toHaveBeenCalledTimes(2);
    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // A content schema's transforms can make the stored serialization differ from the one sent, and a delta against
  // Bytes the server does not hold could never apply
  test("keeps no baseline when the stored bytes' hash is not the sent bytes'", async () => {
    expect.hasAssertions();

    const { saveStagedResourceContent } = setupStagedSave();
    const saveResourceContentDelta = vi.fn<() => ResourceInResource>(() => createResource(resourceId));
    trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta);
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createLargeSheetResource(" "));
    await settleSave();
    saveContent(createLargeSheetResource("a"));
    await settleSave();

    expect(saveResourceContentDelta).not.toHaveBeenCalled();
    expect(saveStagedResourceContent).toHaveBeenCalledTimes(2);
  });

  test("refuses a save over the content limit with a notification and no request", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    await readResource();
    await readContent(noop);
    const content = createDefaultSheetResource();
    content.data.metadata.name = " ".repeat(MAX_RESOURCE_CONTENT_SIZE);
    saveContent(content);

    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(displayNotifications.value).toHaveLength(1);
    expect(saveState.value).toBe(ResourceSaveState.Failed);
  });

  test("skips a save with nothing new since the one it wrote", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    const content = createDefaultSheetResource();
    saveContent(content);
    await settleSave();
    saveContent(content);
    await settleSave();

    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });

  // The signal is armed by the keystroke and cleared by the write, and every door into a write is this one — a
  // Settings dialog saving directly arms nothing, so a door that cleared its own would leave the toolbar at
  // Saving for an edit the server already has. A save with nothing left to write is a save all the same
  test("clears the unwritten-edit signal on a save with nothing to write", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { currentResourceId, saveState, unwrittenContentResourceId } = storeToRefs(resourceStore);
    const { readContent, saveContent, setPersistedContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    setPersistedContent(createDefaultSheetResource());
    unwrittenContentResourceId.value = currentResourceId.value;
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // A refused save stays Not saved only while the content differs from what the server holds. Reverting the edit to
  // That content is a save that lands, so the refusal's state goes with it rather than standing over a document the
  // Server already has
  test("a save with nothing to write clears a refused save's not-saved state", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, refuseSaveContent, saveContent, setPersistedContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    setPersistedContent(createDefaultSheetResource());
    refuseSaveContent();

    expect(saveState.value).toBe(ResourceSaveState.Failed);

    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(saveResourceContent).not.toHaveBeenCalled();
    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // The signal belongs to the resource its edit was made on. Loading another resource must leave it standing, or an
  // Edit the app never wrote would read as saved the moment the owner navigated away from it
  test("keeps the unwritten-edit signal when another resource is loaded", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { currentResourceId, saveState, unwrittenContentResourceId } = storeToRefs(resourceStore);
    const { readResource } = useReadOpenResource();
    await readResource();
    const heldResourceId = currentResourceId.value;
    unwrittenContentResourceId.value = heldResourceId;
    setRouteId(otherResourceId);
    await readResource();

    expect(saveState.value).toBe(ResourceSaveState.Saved);

    setRouteId(heldResourceId);
    await readResource();

    expect(saveState.value).toBe(ResourceSaveState.Saving);
  });

  // Saves of different resources are different single-flight keys, so one settles after the blade has moved on.
  // The contentVersion it carries back is its own resource's, and merged into the loaded one it makes that one's
  // Next save carry a version the server never issued for it — which comes back as a stale rejection
  test("leaves the loaded resource alone when a save settles for another", async () => {
    expect.hasAssertions();

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      await navigatedPromise;
      return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);
    const saveSettled = settleRequest();
    resolveNavigated();
    await saveSettled;

    expect(resource.value?.id).toBe(otherResourceId);
    expect(resource.value?.contentVersion).toBe(0);
  });

  // Content saves are keyed by the resource they write, so one issued before the blade moved on is still in
  // Flight under its own key. Read in aggregate it makes the resource that is loaded now say it is saving work
  // That is not its own — and the toolbar it feeds is what the owner reads to know their edits are safe
  test("reports the loaded resource as saved while another resource's save is still in flight", async () => {
    expect.hasAssertions();

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      await navigatedPromise;
      return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    setRouteId(otherResourceId);
    await readResource();
    await readContent(noop);

    expect(saveState.value).toBe(ResourceSaveState.Saved);

    const saveSettled = settleRequest();
    resolveNavigated();
    await saveSettled;
  });

  // Autosave fires again while the previous save is still in flight, and the row is read when the write is sent
  // Rather than when it was issued — sending the version it was holding makes the server reject our own
  // Overlapping save as a cross-session edit and strand the blade behind a refresh prompt
  test("carries the contentVersion the save ahead of it wrote back", async () => {
    expect.hasAssertions();

    const contentVersions: number[] = [];
    trpcMsw.sheet.saveResourceContent.mutation(({ input }) => {
      contentVersions.push(input.contentVersion);
      return { ...createResource(resourceId), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(contentVersions).toStrictEqual([0, 1]);
  });

  // Two saves issued back to back, against a server that refuses any save sent with a version it no longer holds. The
  // Second is sent once the first has answered, so it carries the version the first left and lands rather than being
  // Refused as stale and leaving the refresh prompt over the blade
  test("does not refuse the second of two quick saves as stale", async () => {
    expect.hasAssertions();

    let serverContentVersion = 0;
    trpcMsw.sheet.saveResourceContent.mutation(({ input }) => {
      if (input.contentVersion !== serverContentVersion)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });

      serverContentVersion++;
      return { ...createResource(resourceId), contentVersion: serverContentVersion };
    });
    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { saveState } = storeToRefs(resourceStore);
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(serverContentVersion).toBe(2);
    expect(saveState.value).toBe(ResourceSaveState.Saved);
    expect(displayNotifications.value).toHaveLength(0);
  });

  // A save queued behind an in-flight one carries the version its content was read at, not the held row's. Another
  // Device's save moves the row, so a save sent with that version is accepted over its content, with no stale notice
  test("a queued save of a closed resource is refused after another device saved", async () => {
    expect.hasAssertions();

    const { promise: isFirstSaveReleased, resolve: releaseFirstSave } = Promise.withResolvers<void>();
    const contentVersions: number[] = [];
    let serverContentVersion = 0;
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      contentVersions.push(input.contentVersion);
      if (contentVersions.length === 1) await isFirstSaveReleased;

      if (input.contentVersion !== serverContentVersion)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });

      serverContentVersion++;
      return { ...createResource(input.id), contentVersion: serverContentVersion };
    });
    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    const resourceStore = useResourceStore();
    const { clearResource, readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    saveContent(createDefaultSheetResource());
    clearResource(resourceId);
    // Another device saves the resource at version 1 while the first save is still in flight
    serverContentVersion = 1;
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(resourceTable, { ...createResource(resourceId), contentVersion: 1, version: 1 });
    releaseFirstSave();
    await settleSave();

    expect(contentVersions).toStrictEqual([0, 0]);
    expect(serverContentVersion).toBe(1);
    expect(displayNotifications.value.map(({ action }) => action?.title)).toStrictEqual(["Refresh", "Refresh"]);
  });

  // A save keeps the version its own opening confirmed. A reopened read confirms the resource's newer version, which is not
  // The version the save was issued at, so the queued save is refused as stale rather than written over that version
  test("sends a save queued before the resource closed the version its opening confirmed, not the one a reopened read confirmed", async () => {
    expect.hasAssertions();

    const { promise: isFirstSaveReleased, resolve: releaseFirstSave } = Promise.withResolvers<void>();
    const contentVersions: number[] = [];
    let serverContentVersion = 0;
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      contentVersions.push(input.contentVersion);
      if (contentVersions.length === 1) await isFirstSaveReleased;

      if (input.contentVersion !== serverContentVersion)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });

      serverContentVersion++;
      return { ...createResource(input.id), contentVersion: serverContentVersion };
    });
    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    const resourceStore = useResourceStore();
    const { clearResource, readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    saveContent(createDefaultSheetResource());
    clearResource(resourceId);
    // Another device saves while the first save is in flight, and the resource is reopened after it
    serverContentVersion = 1;
    readResourceQuery.mockImplementation(({ input }) => ({
      ...createResource(input.id),
      contentVersion: serverContentVersion,
      favorite: null,
      publication: null,
      version: 1,
    }));
    await readResource();
    await readContent(noop);
    releaseFirstSave();
    await settleSave();

    expect(contentVersions).toStrictEqual([0, 0]);
    expect(serverContentVersion).toBe(1);
    expect(displayNotifications.value.map(({ action }) => action?.title)).toStrictEqual(["Refresh", "Refresh"]);
  });

  // The row another device's read brings does not move the version the content was read at. A save queued behind a
  // Refused one is sent with that content version, so the server holds it to the version the content carries
  test("a row read from another device does not raise the version a save carries", async () => {
    expect.hasAssertions();

    const { promise: isFirstSaveReleased, resolve: releaseFirstSave } = Promise.withResolvers<void>();
    const contentVersions: number[] = [];
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      contentVersions.push(input.contentVersion);
      if (contentVersions.length === 1) {
        await isFirstSaveReleased;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }

      return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { clearResource, readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    saveContent(createDefaultSheetResource());
    clearResource(resourceId);
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(resourceTable, { ...createResource(resourceId), contentVersion: 1, version: 1 });
    releaseFirstSave();
    await settleSave();

    expect(contentVersions).toStrictEqual([0, 0]);
  });

  // Records the name of each content the server receives, and holds the first save until the test releases it, so a
  // Save issued meanwhile queues behind it
  const holdFirstSave = () => {
    const { promise, resolve } = Promise.withResolvers<void>();
    const savedNames: string[] = [];
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      savedNames.push(input.content.data.metadata.name);
      if (savedNames.length === 1) await promise;

      return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
    });
    return { releaseFirstSave: resolve, savedNames };
  };

  // A queued save is sent with the content it was issued with. Sent with the object as it stands when its turn
  // Comes, it carries an edit made while it waited, while the persisted baseline records the issued content — so the
  // Server ends on a document the blade no longer shows, and reverting to the issued content is skipped as saved
  test("sends a queued save the content it was issued with", async () => {
    expect.hasAssertions();

    const { releaseFirstSave, savedNames } = holdFirstSave();
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    const content = createDefaultSheetResource();
    content.data.metadata.name = " ";
    saveContent(content);
    content.data.metadata.name = "";
    releaseFirstSave();

    await settleSave();

    expect(savedNames).toStrictEqual(["", " "]);
  });

  // The baseline a save is skipped against is the last content the server confirmed. While another write of the
  // Resource is in flight, that confirmed content is not what the server holds yet, so a save of it still has to be
  // Written — skipping it leaves the in-flight write to land as the last word
  test("does not skip a save of the confirmed content while another write is in flight", async () => {
    expect.hasAssertions();

    const { releaseFirstSave, savedNames } = holdFirstSave();
    const resourceStore = useResourceStore();
    const { readContent, saveContent, setPersistedContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    setPersistedContent(createDefaultSheetResource());
    const content = createDefaultSheetResource();
    content.data.metadata.name = " ";
    saveContent(content);
    saveContent(createDefaultSheetResource());
    releaseFirstSave();

    await settleSave();

    expect(savedNames).toStrictEqual([" ", ""]);
  });

  // The notification that reports a failed save is a one-shot the owner dismisses, so the state is what keeps
  // Saying their work is only in the tab
  test("reports a rejected save as not saved until one lands", async () => {
    expect.hasAssertions();

    let isSaveRejected = true;
    trpcMsw.sheet.saveResourceContent.mutation(({ input }) => {
      if (isSaveRejected) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return { ...createResource(resourceId), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(saveState.value).toBe(ResourceSaveState.Failed);

    isSaveRejected = false;
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // Every retry after a stale rejection is a guaranteed rejection, so the state latches: the remedy is a reload,
  // Not waiting, and the owner has to be able to see that after the warning is gone
  test("a stale version prompts a refresh and holds the content as the save left it", async () => {
    expect.hasAssertions();

    trpcMsw.sheet.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
    });
    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(displayNotifications.value.map(({ action }) => action?.title)).toStrictEqual(["Refresh"]);
  });

  // An explicit reload is a read like any other: its answer can land after a newer read has held a newer version. When the
  // Row it answers with is older, it applies nothing, so it must not clear the stale latch a save raised after that read
  test("an older reload answer leaves a stale latch raised after a newer read", async () => {
    expect.hasAssertions();

    trpcMsw.sheet.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
    });
    const { promise: isReloadReached, resolve: onReloadReached } = Promise.withResolvers<void>();
    const { promise: olderAnswer, resolve: answerOlderReload } = Promise.withResolvers<ReadResourceResult>();
    let readCount = 0;
    trpcMsw.resource.readResource.query(async ({ input }) => {
      readCount++;
      // The first read the store makes is the reload, which is held until its older answer is given
      if (readCount === 1) {
        onReloadReached();
        return olderAnswer;
      }

      return { ...createResource(input.id), favorite: null, publication: null, version: 2 };
    });
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { readContent, reloadResource, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const reload = reloadResource();
    await isReloadReached;
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(saveState.value).toBe(ResourceSaveState.Stale);

    answerOlderReload({ ...createResource(resourceId), favorite: null, publication: null, version: 1 });
    await reload;

    expect(saveState.value).toBe(ResourceSaveState.Stale);
  });

  test("reports a stale save as out of date until the resource is opened afresh", async () => {
    expect.hasAssertions();

    trpcMsw.sheet.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });
    });
    const resourceStore = useResourceStore();
    const { saveState } = storeToRefs(resourceStore);
    const { clearResource, readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(saveState.value).toBe(ResourceSaveState.Stale);

    // A refresh of the open resource keeps its content, so the stale latch holds until the resource is opened afresh
    await readResource();

    expect(saveState.value).toBe(ResourceSaveState.Stale);

    clearResource(resourceId);
    await readResource();

    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // Renames of one resource queue on the row they write, and a refused rename leaves the row as the rename ahead of it
  // Answered it. Nothing it read when it was issued is put back, so the blade never shows a name the server rejected
  test("keeps the name the rename ahead of a refused rename stored", async () => {
    expect.hasAssertions();

    trpcMsw.sheet.updateResource.mutation(({ input }) => {
      if (input.name === failingName) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      // A server write bumps the row's version, so the answer lands over the row it was issued against
      return { ...createResource(resourceId), name: input.name ?? "", version: 1 };
    });
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { renameResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    renameResource(newName);
    renameResource(failingName);
    await waitForSynchronizedFunctions();

    expect(resource.value?.name).toBe(newName);
  });

  // The toast the page's delete leaves is the only way back without a trip to the bin
  test("leaves a single-use restore on the toast a delete raises", async () => {
    expect.hasAssertions();

    trpcMsw.sheet.deleteResource.mutation(() => createResource(resourceId));
    const resourceStore = useResourceStore();
    const { deleteResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    await readResource();
    const deleteSettled = settleRequest();
    deleteResource();
    await deleteSettled;

    const { action } = takeOne(displayNotifications.value);
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
    trpcMsw.sheet.updateResource.mutation(async ({ input }) => {
      await navigatedPromise;
      return { ...createResource(input.id), name: input.name ?? "" };
    });
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { renameResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    renameResource(newName);
    setRouteId(otherResourceId);
    await readResource();
    const { name } = createResource(otherResourceId);
    const renameSettled = settleRequest();
    resolveNavigated();
    await renameSettled;

    expect(resource.value?.id).toBe(otherResourceId);
    expect(resource.value?.name).toBe(name);
  });

  // A tag edit keeps its own executor because it owns fields the rename does not, which only holds if the write
  // Carries nothing but the tags — restating the name would make a tag edit overlapping a rename put the
  // Pre-rename name back on the server while the blade goes on showing the new one
  test("sends only the field each metadata write owns", async () => {
    expect.hasAssertions();

    const updateInputs: UndefinedOnPartial<Partial<Pick<ResourceInResource, "name" | "tags">>>[] = [];
    const { promise: areBothSent, resolve: onBothSent } = Promise.withResolvers<void>();
    trpcMsw.sheet.updateResource.mutation(({ input }) => {
      updateInputs.push({ name: input.name, tags: input.tags });
      if (updateInputs.length === 2) onBothSent();
      return createResource(resourceId);
    });
    const resourceStore = useResourceStore();
    const { renameResource, updateResourceTags } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    renameResource(newName);
    updateResourceTags(tags);
    await areBothSent;

    expect(updateInputs).toStrictEqual([
      { name: newName, tags: undefined },
      { name: undefined, tags },
    ]);
  });

  // A second unpublish queues behind the first on the publication row, and its refusal leaves the tombstone the first one
  // Answered in place. Nothing is put back, so no public link the server no longer serves comes back on screen
  test("keeps the removal a refused second unpublish follows", async () => {
    expect.hasAssertions();

    let isFailing = false;
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { unpublishResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id, ResourceType.Note),
      favorite: null,
      publication,
    }));
    trpcMsw.note.unpublishResource.mutation(() => {
      if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      isFailing = true;
      return { ...publication, deletedAt: new Date(0), version: 1 };
    });
    await readResource();
    unpublishResource();
    unpublishResource();
    await waitForSynchronizedFunctions();

    expect(loadedPublication.value).toBeUndefined();
  });

  // Publishing and unpublishing end the same publication row. The publish is awaited, so it arrives the publication it
  // Created, and a refused unpublish sent behind it takes nothing back: the resource the server published shows as published
  test("keeps the publication a publish answered when an unpublish behind it is refused", async () => {
    expect.hasAssertions();

    const { promise: publishHandled, resolve: resolvePublishHandled } = Promise.withResolvers<void>();
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { publishResource, unpublishResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    trpcMsw.note.publishResource.mutation(() => {
      resolvePublishHandled();
      return publication;
    });
    // Answered only once the publish has been, so the ordering under test is the store's own rather than
    // Whichever response the network happened to deliver first
    trpcMsw.note.unpublishResource.mutation(async () => {
      await publishHandled;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    await readResource();
    publishResource();
    unpublishResource();
    await waitForSynchronizedFunctions();

    expect(loadedPublication.value).toStrictEqual(publication);
  });

  // The publication a publish carries back is its own resource's, so one settling after the blade has moved on
  // Would show the loaded resource as published, complete with a public link the server does not serve
  test("leaves the loaded publication alone when a publish settles for another resource", async () => {
    expect.hasAssertions();

    const { promise: navigatedPromise, resolve: resolveNavigated } = Promise.withResolvers<void>();
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { publishResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    trpcMsw.note.publishResource.mutation(async () => {
      await navigatedPromise;
      return publication;
    });
    await readResource();
    publishResource();
    setRouteId(otherResourceId);
    await readResource();
    const publishSettled = settleRequest();
    resolveNavigated();
    await publishSettled;

    expect(loadedPublication.value).toBeUndefined();
  });

  // The dispatch is the loaded row's own type, so the content read has to follow the type the route named
  // Rather than whichever router the calling store happens to be written against
  test("reads content through the loaded type's own router", async () => {
    expect.hasAssertions();

    const readResourceContent = vi.fn<() => NoteResource>(() => ({ doc: EMPTY_NOTE_DOC }));
    const resourceStore = setupNoteResource();
    const { readContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    trpcMsw.note.readResourceContent.query(readResourceContent);
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

    const readResourcePublication = vi.fn<() => ResourcePublicationInResource>(() => publication);
    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { readResource } = useReadOpenResource();
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id, ResourceType.Note),
      favorite: null,
      publication,
    }));
    trpcMsw.note.readResourcePublication.query(readResourcePublication);
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
    const { readResource } = useReadOpenResource();
    await readResource();

    expect(loadedPublication.value).toBeUndefined();
  });

  test("publishes and unpublishes through the loaded type's own router", async () => {
    expect.hasAssertions();

    const resourceStore = setupNoteResource();
    const { publication: loadedPublication } = storeToRefs(resourceStore);
    const { publishResource, unpublishResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    trpcMsw.note.publishResource.mutation(() => publication);
    trpcMsw.note.unpublishResource.mutation(() => ({ ...publication, deletedAt: new Date(0), version: 1 }));
    await readResource();
    publishResource();
    await waitForSynchronizedFunctions();

    expect(loadedPublication.value).toStrictEqual(publication);

    const unpublishSettled = settleRequest();
    unpublishResource();
    await unpublishSettled;

    expect(loadedPublication.value).toBeUndefined();
  });

  // The store is app-lifetime and this state is one blade's, so the page that opened the resource takes it
  // Back down again rather than leaving the next blade to render the previous resource's name
  test("takes the blade's state down with the page that opened it", async () => {
    expect.hasAssertions();

    const resourceStore = setupNoteResource();
    const { publication: loadedPublication, resource } = storeToRefs(resourceStore);
    const { clearResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id, ResourceType.Note),
      favorite: null,
      publication,
    }));
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
    const { clearResource } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    setRouteId(otherResourceId);
    await readResource();
    clearResource(resourceId);

    expect(resource.value?.id).toBe(otherResourceId);
  });

  // A save that settles while its resource is closed drops the version the content was confirmed at, so the content in hand
  // Stops belonging to that resource. Reopening it must read the content again, not claim it still, or the next save has no version
  test("reopening a resource whose save settled while it was away reads its content again", async () => {
    expect.hasAssertions();

    const { promise: isFirstSaveReleased, resolve: releaseFirstSave } = Promise.withResolvers<void>();
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      await isFirstSaveReleased;
      return { ...createResource(input.id), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { checkIsContentRead, clearResource, readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    saveContent(createDefaultSheetResource());
    // The next blade opens before this one closes, as a keyed page swap does, so the close leaves the state alone
    setRouteId(otherResourceId);
    await readResource();
    clearResource(resourceId);
    releaseFirstSave();
    await settleSave();
    setRouteId(resourceId);
    await readResource();

    expect(checkIsContentRead()).toBe(false);
  });

  // A list view names no resource, and a read racing the navigation onto one resolves the route after it has
  // Left the blade — the empty sentinel would reach the server as a uuid input that fails validation
  test("issues no read when the route names no resource", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { isPending, readResource } = useReadOpenResource();
    setRouteId("");
    await readResource();

    expect(readResourceQuery).not.toHaveBeenCalled();
    expect(resource.value).toBeUndefined();
    expect(isPending.value).toBe(false);
  });

  // Refresh runs the store's reload, which the page's header reads as in flight to disable itself while the read runs
  test("shows a refresh of the open resource as in flight until it lands", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { isReloadPending } = storeToRefs(resourceStore);
    const { reloadResource } = resourceStore;
    await useReadOpenResource().readResource();
    const refresh = reloadResource();

    expect(isReloadPending.value).toBe(true);
    await refresh;
    expect(isReloadPending.value).toBe(false);
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

  // The page's watch of the open row re-runs its read when a write publishes that row's topic, and every content write
  // Updates the row. A refetch of the open row is therefore what a write to the content looks like to the store
  const serveOpenRow = (row: Partial<ResourceInResource>) => {
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id),
      ...row,
      favorite: null,
      publication: null,
    }));
  };
  const otherDeviceHash = "other-device-content-hash";

  // The store holds the hash of the content it read or wrote, so the watch's refetch of an editor's own save finds a hash
  // The store already holds: it reads no blob and applies nothing
  test("an editor's own save applies nothing when its watch fires for it", async () => {
    expect.hasAssertions();

    const savedHash = "saved-content-hash";
    const applyContent = vi.fn<(content: unknown) => void>();
    const readContentQuery = vi.fn<() => SheetResource>(() => createDefaultSheetResource());
    trpcMsw.sheet.readResourceContent.query(readContentQuery);
    trpcMsw.sheet.saveResourceContent.mutation(() => ({
      ...createResource(resourceId),
      contentHash: savedHash,
      contentVersion: 1,
    }));
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const unregisterReload = ResourceContentHookMap.Reload.register(() => readContent(applyContent));
    await readResource();
    await readContent(applyContent);
    saveContent(createDefaultSheetResource());
    await settleSave();
    await withFinalizerAsync(async () => {
      serveOpenRow({ contentHash: savedHash, contentVersion: 1 });
      await readResource();
      await waitForSynchronizedFunctions();
    }, unregisterReload);

    expect(readContentQuery).toHaveBeenCalledTimes(1);
    expect(applyContent).toHaveBeenCalledTimes(1);
  });

  // Another device's save is a row whose hash the store does not hold, so the watch's refetch reads the content and the
  // Editor adopts it through the two stages a restore runs
  test("another device's save reaches the open editor through the watch", async () => {
    expect.hasAssertions();

    const applyContent = vi.fn<(content: unknown) => void>();
    const readContentQuery = vi.fn<() => SheetResource>(() => createDefaultSheetResource());
    trpcMsw.sheet.readResourceContent.query(readContentQuery);
    const resourceStore = useResourceStore();
    const { readContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const unregisterReload = ResourceContentHookMap.Reload.register(() => readContent(applyContent));
    await readResource();
    await readContent(applyContent);
    await withFinalizerAsync(async () => {
      serveOpenRow({ contentHash: otherDeviceHash, contentVersion: 1 });
      await readResource();
      await waitForSynchronizedFunctions();
    }, unregisterReload);

    expect(readContentQuery).toHaveBeenCalledTimes(2);
    expect(applyContent).toHaveBeenCalledTimes(2);
  });

  // Another writer's commit lands on top of this store's own save while that save is still in flight, so the watch's refetch
  // Of the row lands during it. The row is compared once the save has answered, since the answer sets the hash it is
  // Compared against, and the other writer's content is adopted
  test("adopts another writer's commit that lands on top of an own save still in flight", async () => {
    expect.hasAssertions();

    const ownContentHash = "own-content-hash";
    const applyContent = vi.fn<(content: unknown) => void>();
    const readContentQuery = vi.fn<() => SheetResource>(() => createDefaultSheetResource());
    trpcMsw.sheet.readResourceContent.query(readContentQuery);
    const { promise: saveAnswered, resolve: answerSave } = Promise.withResolvers<void>();
    trpcMsw.sheet.saveResourceContent.mutation(async ({ input }) => {
      await saveAnswered;
      return { ...createResource(input.id), contentHash: ownContentHash, contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    const unregisterReload = ResourceContentHookMap.Reload.register(() => readContent(applyContent));
    await readResource();
    await readContent(applyContent);
    saveContent(createDefaultSheetResource());
    serveOpenRow({ contentHash: otherDeviceHash, contentVersion: 2 });
    await readResource();
    answerSave();
    await withFinalizerAsync(async () => {
      await settleSave();
      await waitForSynchronizedFunctions();
    }, unregisterReload);

    expect(readContentQuery).toHaveBeenCalledTimes(2);
    expect(applyContent).toHaveBeenCalledTimes(2);
  });

  // An unwritten edit is the person's, and another device's save must not replace it. The save is held behind the
  // Stale latch, which holds autosave too, until the person answers
  test("an unsaved edit stays on screen when another device saves", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { heldSave, resource, saveState, unwrittenContentResourceId } = storeToRefs(resourceStore);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    assert.exists(resource.value);
    const { contentVersion, id } = resource.value;
    const reload = vi.fn<(type: ResourceType) => void>();
    const unregisterReload = ResourceContentHookMap.Reload.register(reload);
    await readContent(noop);
    unwrittenContentResourceId.value = id;
    await withFinalizerAsync(async () => {
      serveOpenRow({ contentHash: otherDeviceHash, contentVersion: contentVersion + 1 });
      await readResource();
    }, unregisterReload);
    saveContent(createDefaultSheetResource());

    expect(reload).not.toHaveBeenCalled();
    expect(heldSave.value).toStrictEqual({ contentVersion: contentVersion + 1 });
    expect(saveState.value).toBe(ResourceSaveState.Stale);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // Taking theirs adopts the other version and drops the unwritten edit with the document it was an edit of
  test("taking theirs replaces the unsaved edit", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { takeOtherSave } = resourceStore;
    const { heldSave, resource, saveState, unwrittenContentResourceId } = storeToRefs(resourceStore);
    const { readContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    assert.exists(resource.value);
    const { contentVersion, id } = resource.value;
    const reload = vi.fn<(type: ResourceType) => void>();
    const unregisterReload = ResourceContentHookMap.Reload.register(reload);
    await readContent(noop);
    unwrittenContentResourceId.value = id;
    await withFinalizerAsync(async () => {
      serveOpenRow({ contentHash: otherDeviceHash, contentVersion: contentVersion + 1 });
      await readResource();
      await takeOtherSave();
    }, unregisterReload);

    expect(reload).toHaveBeenCalledExactlyOnceWith(ResourceType.Sheet);
    expect(heldSave.value).toBeUndefined();
    expect(unwrittenContentResourceId.value).toBe("");
    expect(saveState.value).toBe(ResourceSaveState.Saved);
  });

  // Keeping mine re-writes the local document as the newest version, so the other save is one version back in history
  // And not overwritten. The kept write is sent at the other save's version, which the store takes as its base
  test("keeping mine saves over the other version and keeps it in history", async () => {
    expect.hasAssertions();

    const contentVersions: number[] = [];
    trpcMsw.sheet.saveResourceContent.mutation(({ input }) => {
      contentVersions.push(input.contentVersion);
      return { ...createResource(resourceId), contentVersion: input.contentVersion + 1 };
    });
    const resourceStore = useResourceStore();
    const { heldSave, resource, unwrittenContentResourceId } = storeToRefs(resourceStore);
    const { keepUnwrittenContent, readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    assert.exists(resource.value);
    const { contentVersion, id } = resource.value;
    const keep = vi.fn<(type: ResourceType) => void>();
    const unregisterKeep = ResourceContentHookMap.Keep.register(keep);
    await readContent(noop);
    unwrittenContentResourceId.value = id;
    await withFinalizerAsync(async () => {
      serveOpenRow({ contentHash: otherDeviceHash, contentVersion: contentVersion + 1 });
      await readResource();
      await keepUnwrittenContent();
    }, unregisterKeep);
    saveContent(createDefaultSheetResource());
    await settleSave();

    expect(keep).toHaveBeenCalledExactlyOnceWith(ResourceType.Sheet);
    expect(contentVersions).toStrictEqual([contentVersion + 1]);
    expect(heldSave.value).toBeUndefined();
  });

  // An editor with nothing unwritten adopts another device's save in place, through the same two stages a restore runs
  test("an editor with nothing unsaved adopts a save in place", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { readContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    const reload = vi.fn<(type: ResourceType) => void>();
    const adopt = vi.fn<(type: ResourceType) => void>();
    const unregisterReload = ResourceContentHookMap.Reload.register(reload);
    const unregisterAdopt = ResourceContentHookMap.Adopt.register(adopt);
    await withFinalizerAsync(
      async () => {
        serveOpenRow({ contentHash: otherDeviceHash, contentVersion: 1 });
        await readResource();
        await waitForSynchronizedFunctions();
      },
      () => {
        unregisterReload();
        unregisterAdopt();
      },
    );

    expect(reload).toHaveBeenCalledExactlyOnceWith(ResourceType.Sheet);
    expect(adopt).toHaveBeenCalledExactlyOnceWith(ResourceType.Sheet);
  });

  // Every open resource's editor takes another device's save through the same store door, whatever its type
  test.each([ResourceType.Note, ResourceType.Sheet, ResourceType.TodoList])(
    "an open resource of any type reloads for another device's save (%s)",
    async (type) => {
      expect.hasAssertions();

      trpcMsw.resource.readResource.query(({ input }) => ({
        ...createResource(input.id, type),
        favorite: null,
        publication: null,
      }));
      trpcMsw.note.readResourceContent.query(() => undefined);
      trpcMsw.sheet.readResourceContent.query(() => undefined);
      trpcMsw.todoList.readResourceContent.query(() => undefined);
      const reload = vi.fn<(reloadedType: ResourceType) => void>();
      const unregisterReload = ResourceContentHookMap.Reload.register(reload);
      const resourceStore = useResourceStore();
      const { readContent } = resourceStore;
      const { readResource } = useReadOpenResource();
      await readResource();
      await readContent(noop);
      await withFinalizerAsync(async () => {
        trpcMsw.resource.readResource.query(({ input }) => ({
          ...createResource(input.id, type),
          contentHash: otherDeviceHash,
          contentVersion: 1,
          favorite: null,
          publication: null,
        }));
        await readResource();
        await waitForSynchronizedFunctions();
      }, unregisterReload);

      expect(reload).toHaveBeenCalledExactlyOnceWith(type);
    },
  );

  // Undo replays onto the document a command was recorded against, and a delta is measured against the bytes this
  // Client last held — both are the document another device's save replaced, so both go with it
  test("adopting a save clears undo history and the delta baseline", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    deleteRows([takeOne(dataSource.rows, 0).id]);
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    await useReadOpenResource().readResource();
    assert.exists(resource.value);
    const loadedContent = createLargeSheetResource(" ");
    const loadedContentBytes = new TextEncoder().encode(JSON.stringify(loadedContent));
    const presignedUrl = `${window.location.origin}/${resourceId}`;
    server.use(http.get(`${window.location.origin}/${resourceId}`, () => new HttpResponse(loadedContentBytes)));
    trpcMsw.resource.readResource.query(({ input }) => ({
      ...createResource(input.id),
      contentSize: loadedContentBytes.byteLength,
      favorite: null,
      publication: null,
    }));
    trpcMsw.sheet.generateReadContentPresignedUrl.query(() => presignedUrl);
    const { saveStagedResourceContent } = setupStagedSave();
    const saveResourceContentDelta = vi.fn<() => ResourceInResource>(() => createResource(resourceId));
    trpcMsw.sheet.saveResourceContentDelta.mutation(saveResourceContentDelta);
    const { readContent, saveContent } = resourceStore;
    const { readResource } = useReadOpenResource();
    await readResource();
    await readContent(noop);
    assert.exists(resource.value);
    serveOpenRow({
      contentHash: otherDeviceHash,
      contentSize: loadedContentBytes.byteLength,
      contentVersion: resource.value.contentVersion + 1,
    });
    await readResource();
    await waitForSynchronizedFunctions();
    const isUndoableAfterAdoption = isUndoable.value;
    saveContent(createLargeSheetResource("a"));
    await settleSave();

    expect(isUndoableAfterAdoption).toBe(false);
    expect(saveResourceContentDelta).not.toHaveBeenCalled();
    expect(saveStagedResourceContent).toHaveBeenCalledTimes(1);
  });
});
