import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";
import type { ResourceListPage } from "#shared/models/resource/ResourceListPage";
import type { R2Bucket, R2Object } from "@cloudflare/workers-types";
import type { ResourceInResource, ResourcePublicationInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";
import { getStagingContentBlobName } from "#server/services/resource/getStagingContentBlobName";
import { softDeleteResources } from "#server/services/resource/softDeleteResources";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { blueprintRouter } from "#server/trpc/routers/blueprint";
import { dashboardRouter } from "#server/trpc/routers/dashboard";
import { emailRouter } from "#server/trpc/routers/email";
import { trpcRouter } from "#server/trpc/routers/index";
import { noteRouter } from "#server/trpc/routers/note";
import { programRouter } from "#server/trpc/routers/program";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { surveyRouter } from "#server/trpc/routers/survey";
import { todoListRouter } from "#server/trpc/routers/todoList";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { whiteboardRouter } from "#server/trpc/routers/whiteboard";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { MimeType } from "#shared/models/file/MimeType";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createTestImageNode } from "#shared/services/pageBuilder/constants.test";
import { createEmptyBlueprint } from "#shared/services/resource/blueprint/createEmptyBlueprint";
import {
  ASSET_DECISION_CLOCK_MARGIN_MS,
  ASSET_GRACE_MS,
  CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE,
  MAX_RESOURCE_CONTENT_SIZE,
  STALE_CONTENT_VERSION_ERROR_MESSAGE,
} from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createEmptyNote } from "#shared/services/resource/note/createEmptyNote";
import { createEmptyProgram } from "#shared/services/resource/program/createEmptyProgram";
import { createDefaultSheetResource } from "#shared/services/resource/sheet/createDefaultSheetResource";
import { createEmptySurvey } from "#shared/services/resource/survey/createEmptySurvey";
import { createEmptyTodoList } from "#shared/services/resource/todoList/createEmptyTodoList";
import { createEmptyWhiteboard } from "#shared/services/resource/whiteboard/createEmptyWhiteboard";
import { deleteDirectory, getContentBlobName, readJsonBlob } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  DatabaseEntityType,
  getResourceFilesDirectoryName,
  QueueJob,
  resourcePublicationsInResource,
  resourcesInResource,
  ResourceType,
  resourceViewsInResource,
  StorageBucket,
  storageLedgerInStorage,
} from "@esposter/db-schema";
import {
  InvalidOperationError,
  jsonDateParse,
  noop,
  NotFoundError,
  Operation,
  waitForSynchronizedFunctions,
} from "@esposter/shared";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { gzipSync, zstdCompressSync } from "node:zlib";
import { v7 } from "uuid";
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { PositionedElementType, TextSize } from "vue-block-editor-headless";

// A caller of a type with the fileAssets capability, and of a publishable one: each adds its group beside the base procedures
type FileAssetsCaller<TType extends FileAssetsResourceType> = FileAssetsResourceCaller & ResourceTypeCaller<TType>;
// The procedures a type with the fileAssets capability generates beside the base ones
interface FileAssetsResourceCaller {
  deleteFile: (input: { blobPath: string; id: string }) => Promise<void>;
  generateUploadFilePresignedUrlEntities: (input: {
    files: { hash: string; mimetype: string; size: number }[];
    id: string;
  }) => Promise<ResourceFilePresignedUrlEntity[]>;
  readResourceFiles: (input: { id: string }) => Promise<ResourceFile[]>;
}
type PublishableCaller<TType extends PublishableResourceType> = PublishableResourceCaller<ResourceContent<TType>> &
  ResourceTypeCaller<TType>;
// The procedures a publishable type generates beside the base ones, answering its content as the base reads do
interface PublishableResourceCaller<TContent> {
  publishResource: (input: { id: string }) => Promise<ResourcePublicationInResource>;
  readPublishedResourceContent: (id: string) => Promise<{ content: TContent; name: string }>;
  readPublishedVersionContent: (input: { id: string; version: number }) => Promise<{ content: TContent; name: string }>;
  readResourcePublication: (input: { id: string }) => Promise<ResourcePublicationInResource | undefined>;
  readResourceViewCount: (input: { id: string }) => Promise<number>;
  unpublishResource: (input: { id: string }) => Promise<ResourceInResource>;
}
// The procedures every type's factory generates, over that type's content. The content is the one thing a type narrows, so the
// Caller is generic in it: a save takes the content the type holds, and a read answers it. Each type's router is checked against
// This shape at its own entry in the caller map, so a procedure a router renames or drops fails there
interface ResourceCaller<TContent> {
  createResource: (input: { name: string }) => Promise<ResourceInResource>;
  deleteResource: (input: { id: string }) => Promise<ResourceInResource>;
  generateUploadContentPresignedUrl: (input: { id: string; size: number }) => Promise<string>;
  readResourceContent: (input: { id: string }) => Promise<TContent | undefined>;
  readResources: () => Promise<ResourceListPage>;
  saveResourceContent: (input: {
    content: TContent;
    contentVersion: number;
    id: string;
  }) => Promise<ResourceInResource>;
  saveResourceContentDelta: (input: {
    baselineHash: string;
    contentVersion: number;
    delta: string;
    id: string;
  }) => Promise<ResourceInResource>;
  saveStagedResourceContent: (input: {
    contentVersion: number;
    hash: string;
    id: string;
  }) => Promise<ResourceInResource>;
  updateResource: (input: { id: string; name: string }) => Promise<ResourceInResource>;
}
// A type's caller: the base procedures over the type's own content, which every type's factory generates
type ResourceTypeCaller<TType extends ResourceType> = ResourceCaller<ResourceContent<TType>>;

// The generic resource-procedure matrix runs for every type at the foot of this suite, through each type's own router.
// The tests above it hold what one type decides beyond that matrix: the dashboard's delta and staging conflicts, its
// Published versions, and the owner guards each procedure shares.
describe(createResourceProcedures, () => {
  let mockContext: Context;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  // Dashboard is the publishable representative; Webpage is the FileAssets one
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;
  const name = "name";
  const updatedName = "updatedName";
  const hash = "a".repeat(64);
  const mimetype = MimeType.Png;
  const size = 1;
  // Each type's caller, made by its own router over the mock context once its row runs. Each entry is checked at its own
  // Router against the procedures its capabilities generate, so a router that renames or drops one fails at that entry
  const resourceTypeCallerMap = {
    [ResourceType.Blueprint]: () =>
      createCallerFactory(blueprintRouter)(mockContext) satisfies ResourceTypeCaller<typeof ResourceType.Blueprint>,
    [ResourceType.Dashboard]: () =>
      createCallerFactory(dashboardRouter)(mockContext) satisfies PublishableCaller<typeof ResourceType.Dashboard>,
    [ResourceType.Email]: () =>
      createCallerFactory(emailRouter)(mockContext) satisfies FileAssetsCaller<typeof ResourceType.Email> &
        PublishableCaller<typeof ResourceType.Email>,
    [ResourceType.Note]: () =>
      createCallerFactory(noteRouter)(mockContext) satisfies FileAssetsCaller<typeof ResourceType.Note> &
        PublishableCaller<typeof ResourceType.Note>,
    [ResourceType.Program]: () =>
      createCallerFactory(programRouter)(mockContext) satisfies ResourceTypeCaller<typeof ResourceType.Program>,
    [ResourceType.Sheet]: () =>
      createCallerFactory(sheetRouter)(mockContext) satisfies ResourceTypeCaller<typeof ResourceType.Sheet>,
    [ResourceType.Survey]: () =>
      createCallerFactory(surveyRouter)(mockContext) satisfies FileAssetsCaller<typeof ResourceType.Survey> &
        PublishableCaller<typeof ResourceType.Survey>,
    [ResourceType.TodoList]: () =>
      createCallerFactory(todoListRouter)(mockContext) satisfies ResourceTypeCaller<typeof ResourceType.TodoList>,
    [ResourceType.Webpage]: () =>
      createCallerFactory(webpageRouter)(mockContext) satisfies FileAssetsCaller<typeof ResourceType.Webpage> &
        PublishableCaller<typeof ResourceType.Webpage>,
    [ResourceType.Whiteboard]: () =>
      createCallerFactory(whiteboardRouter)(mockContext) satisfies FileAssetsCaller<typeof ResourceType.Whiteboard>,
  } satisfies { [TType in ResourceType]: () => ResourceTypeCaller<TType> };
  // The starting content each type's editor saves on first use. A model's own default where its store builds the model from
  // Its constructor, and the factory its store starts from everywhere else
  const resourceTypeCreateContentMap = {
    [ResourceType.Blueprint]: createEmptyBlueprint,
    [ResourceType.Dashboard]: () => new Dashboard(),
    [ResourceType.Email]: () => new EmailEditor(),
    [ResourceType.Note]: createEmptyNote,
    [ResourceType.Program]: createEmptyProgram,
    [ResourceType.Sheet]: createDefaultSheetResource,
    [ResourceType.Survey]: createEmptySurvey,
    [ResourceType.TodoList]: createEmptyTodoList,
    [ResourceType.Webpage]: () => new WebpageEditor(),
    [ResourceType.Whiteboard]: createEmptyWhiteboard,
  } satisfies { [TType in ResourceType]: () => ResourceContent<TType> };
  // The content each type's delta test changes its starting content to: the one field that makes it differ, built through
  // The type's own factory or constructor, and valid under its content schema
  const resourceTypeChangedContentMap = {
    [ResourceType.Blueprint]: () => ({
      ...createEmptyBlueprint(),
      parameters: [{ defaultValue: "", description: "", key: "changed", title: "" }],
    }),
    [ResourceType.Dashboard]: () => new Dashboard({ visuals: [new Visual()] }),
    [ResourceType.Email]: () => {
      const email = new EmailEditor();
      email.root = { props: { ...email.root.props, title: "changed" } };
      return email;
    },
    [ResourceType.Note]: () => ({
      ...createEmptyNote(),
      doc: { content: [{ content: [{ text: "changed", type: "text" }], type: "paragraph" }], type: "doc" },
    }),
    [ResourceType.Program]: () => ({ ...createEmptyProgram(), keyColumn: "changed" }),
    [ResourceType.Sheet]: () => {
      const sheet = createDefaultSheetResource();
      return { ...sheet, data: { ...sheet.data, metadata: { ...sheet.data.metadata, name: "changed" } } };
    },
    [ResourceType.Survey]: () => ({
      ...createEmptySurvey(),
      settings: surveySettingsSchema.parse({ isAcceptingResponses: false }),
    }),
    [ResourceType.TodoList]: () => ({ ...createEmptyTodoList(), items: [new TodoListItem({ name: "changed" })] }),
    [ResourceType.Webpage]: () => new WebpageEditor({ description: "changed" }),
    [ResourceType.Whiteboard]: () => ({
      ...createEmptyWhiteboard(),
      elements: [
        {
          color: "",
          id: v7(),
          isWrapped: true,
          text: "changed",
          textSize: TextSize.Small,
          type: PositionedElementType.Text,
          width: 100,
          x: 0,
          y: 0,
        },
      ],
    }),
  } satisfies { [TType in ResourceType]: () => ResourceContent<TType> };
  // Uploads a staged save the way the client does — through the write target its presigned url query reserves — and hands
  // Back the hash its commit names
  const stageContent = async (
    stagingCaller: Pick<ResourceCaller<ResourceContent<ResourceType>>, "generateUploadContentPresignedUrl">,
    id: string,
    compressedContent: Buffer,
  ) => {
    await stagingCaller.generateUploadContentPresignedUrl({ id, size: compressedContent.byteLength });
    await bucket.put(getStagingContentBlobName(id), compressedContent);
    return createHash("sha256").update(compressedContent).digest("hex");
  };

  // Routes the bucket's `head` through `head` and every other call to the store, for the one call a race has to land between.
  // A spy on the bucket's own method does not reach the call, so the bucket the procedure reads is replaced for the test
  // The commit reads only a staged object's etag and size, so an intercepted measurement names those two
  const interceptHead = (head: (blobName: string) => Promise<null | Pick<R2Object, "etag" | "size">>) => {
    mockBuckets[StorageBucket.ResourceAssets] = new Proxy(bucket, {
      get: (target, property: keyof R2Bucket) => {
        if (property === "head") return head;
        const value: unknown = Reflect.get(target, property);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  };

  // Routes the bucket's `put` through `afterPut`, which runs once the object is stored: the one call a race has to land after
  const interceptPut = (afterPut: () => Promise<void>) => {
    mockBuckets[StorageBucket.ResourceAssets] = new Proxy(bucket, {
      get: (target, property: keyof R2Bucket) => {
        if (property !== "put") {
          const value: unknown = Reflect.get(target, property);
          return typeof value === "function" ? value.bind(target) : value;
        }
        return async (...args: Parameters<R2Bucket["put"]>) => {
          const stored = await target.put(...args);
          await afterPut();
          return stored;
        };
      },
    });
  };

  const readResourceViews = (resourceId: string) =>
    mockContext.db.select().from(resourceViewsInResource).where(eq(resourceViewsInResource.resourceId, resourceId));

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
    mockContext = await createMockContext();
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    resourceCaller = createCallerFactory(trpcRouter)(mockContext).resource;
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  // Off the epoch, which a channel with no age limit cuts off at: a version written at the epoch is not newer than it
  beforeEach(() => {
    vi.useFakeTimers({ now: Temporal.Instant.fromEpochMilliseconds(1), toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await deleteDirectory(bucket);
    MockJobQueueDatabase.clear();
    // Cascade removes any resourcePublications, activity and view rows too
    await mockContext.db.delete(resourcesInResource);
    await mockContext.db.delete(storageLedgerInStorage);
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await dispose();
  });

  test("reads the type's resources a page at a time, the total with the first page", async () => {
    expect.hasAssertions();

    const { count: emptyCount, items: emptyItems } = await dashboardCaller.readResources();

    expect(emptyItems).toStrictEqual([]);
    expect(emptyCount).toBe(0);

    const firstResource = await dashboardCaller.createResource({ name });
    const secondResource = await dashboardCaller.createResource({ name: updatedName });
    const firstPage = await dashboardCaller.readResources({ limit: 1 });
    const secondPage = await dashboardCaller.readResources({ cursor: firstPage.nextCursor, limit: 1 });

    expect(firstPage.count).toBe(2);
    expect(firstPage.items.map(({ id }) => id)).toStrictEqual([secondResource.id]);
    expect(secondPage.count).toBeUndefined();
    expect(secondPage.items.map(({ id }) => id)).toStrictEqual([firstResource.id]);
    expect(secondPage.nextCursor).toBe("");
  });

  test("reads only published resources when filtered to published", async () => {
    expect.hasAssertions();

    const publishedResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.createResource({ name: updatedName });
    await dashboardCaller.saveResourceContent({
      content: new Dashboard(),
      contentVersion: 0,
      id: publishedResource.id,
    });
    await dashboardCaller.publishResource({ id: publishedResource.id });
    const { count, items, nextCursor } = await dashboardCaller.readResources({ isPublished: true, limit: 1 });

    expect(count).toBe(1);
    expect(nextCursor).toBe("");
    expect(items.map(({ id }) => id)).toStrictEqual([publishedResource.id]);
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const otherUserAuthSession = await createMockAuthSession(mockContext.db);

    await expect(
      createCallerFactory(dashboardRouter)(await createMockContext(otherUserAuthSession)).updateResource({
        id: newResource.id,
        name: updatedName,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("reads undefined content for new resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const content = await dashboardCaller.readResourceContent({ id: newResource.id });

    expect(content).toBeUndefined();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const updatedResource = await dashboardCaller.saveResourceContent({
      content: dashboard,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    expect(updatedResource.contentVersion).toBe(1);

    const content = await dashboardCaller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("fails save content with old content version", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard();
    await dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });

    await expect(
      dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${STALE_CONTENT_VERSION_ERROR_MESSAGE}]`);
  });

  // Another device's save moved the stored bytes, so the client's baseline no longer names them
  test("fails save content delta against a baseline the resource no longer holds", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const { contentHash } = await dashboardCaller.saveResourceContent({
      content: new Dashboard(),
      contentVersion: 0,
      id: newResource.id,
    });
    await dashboardCaller.saveResourceContent({
      content: new Dashboard({ visuals: [new Visual()] }),
      contentVersion: 1,
      id: newResource.id,
    });

    await expect(
      dashboardCaller.saveResourceContentDelta({
        baselineHash: contentHash,
        contentVersion: 2,
        delta: "",
        id: newResource.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE}]`);
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 2);
  });

  test("commits staged content and releases its staging blob", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const stagedHash = await stageContent(dashboardCaller, newResource.id, gzipSync(JSON.stringify(dashboard)));
    const updatedResource = await dashboardCaller.saveStagedResourceContent({
      contentVersion: newResource.contentVersion,
      hash: stagedHash,
      id: newResource.id,
    });
    const content = await dashboardCaller.readResourceContent({ id: newResource.id });
    const storageLedgerEntries = await mockContext.db.query.storageLedgerInStorage.findMany();

    expect(updatedResource.contentVersion).toBe(1);
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
    await expect(bucket.head(getStagingContentBlobName(newResource.id))).resolves.toBeNull();
    // The content blob's own charge is all that is left
    expect(storageLedgerEntries.map(({ blobName }) => blobName)).toStrictEqual([getContentBlobName(newResource.id)]);
  });

  test("fails commit staged content that does not match its hash", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const stagedHash = await stageContent(dashboardCaller, newResource.id, gzipSync(JSON.stringify(new Dashboard())));
    await stageContent(
      dashboardCaller,
      newResource.id,
      gzipSync(JSON.stringify(new Dashboard({ visuals: [new Visual()] }))),
    );

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash: stagedHash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content does not match its hash]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
  });

  test("fails commit staged content replaced after it was measured", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const stagedHash = await stageContent(dashboardCaller, newResource.id, gzipSync(JSON.stringify(new Dashboard())));
    const replacement = gzipSync(JSON.stringify(new Dashboard({ visuals: [new Visual()] })));
    // Another upload lands on the staged name between its measurement and its download
    const measure = bucket.head.bind(bucket);
    interceptHead(async (blobName) => {
      const measured = await measure(blobName);
      await bucket.put(blobName, replacement);
      return measured;
    });

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash: stagedHash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content does not match its hash]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
    await expect(bucket.head(getStagingContentBlobName(newResource.id))).resolves.toHaveProperty(
      "size",
      replacement.byteLength,
    );
  });

  test("fails commit staged content larger than the content limit", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const stagedHash = await stageContent(dashboardCaller, newResource.id, gzipSync(JSON.stringify(new Dashboard())));
    // The staged object as the bucket measured it, reported at a size past the limit
    interceptHead(async (blobName) => {
      const measured = await bucket.head(blobName);
      assert.exists(measured);
      return { etag: measured.etag, size: MAX_RESOURCE_CONTENT_SIZE + 1 };
    });

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash: stagedHash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content is larger than 100000000 bytes]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
  });

  test("fails commit staged content that inflates past the content limit", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const stagedHash = await stageContent(
      dashboardCaller,
      newResource.id,
      gzipSync(Buffer.alloc(MAX_RESOURCE_CONTENT_SIZE + 1)),
    );

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash: stagedHash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content is not a gzip of at most 100000000 bytes]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
  });

  test("fails commit staged content with old content version", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    const stagedHash = await stageContent(dashboardCaller, newResource.id, gzipSync(JSON.stringify(new Dashboard())));

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash: stagedHash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${STALE_CONTENT_VERSION_ERROR_MESSAGE}]`);
  });

  test("fails save content with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const otherUserAuthSession = await createMockAuthSession(mockContext.db);

    await expect(
      createCallerFactory(dashboardRouter)(await createMockContext(otherUserAuthSession)).saveResourceContent({
        content: new Dashboard(),
        contentVersion: 0,
        id: newResource.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes and reads published content", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    await dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    const publication = await dashboardCaller.publishResource({ id: newResource.id });

    expect(publication.publishVersion).toBe(1);

    const publishedContent = await dashboardCaller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("reads an older published version's content for the owner", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const firstDashboard = new Dashboard({ visuals: [new Visual()] });
    await dashboardCaller.saveResourceContent({ content: firstDashboard, contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 1, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const firstVersion = await dashboardCaller.readPublishedVersionContent({ id: newResource.id, version: 1 });

    // The v1 snapshot survives republishing to v2, so the owner can still read it back
    expect(firstVersion.name).toBe(name);
    expect(firstVersion.content).toStrictEqual(jsonDateParse(JSON.stringify(firstDashboard)));
  });

  test("fails read published version content with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const otherUserAuthSession = await createMockAuthSession(mockContext.db);

    await expect(
      createCallerFactory(dashboardRouter)(await createMockContext(otherUserAuthSession)).readPublishedVersionContent({
        id: newResource.id,
        version: 1,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("bumps publish version on republish", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const republication = await dashboardCaller.publishResource({ id: newResource.id });

    expect(republication.publishVersion).toBe(2);
  });

  test("reads publication state", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const publication = await dashboardCaller.readResourcePublication({ id: newResource.id });

    expect(publication).toBeUndefined();

    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });

    expect((await dashboardCaller.readResourcePublication({ id: newResource.id }))?.publishVersion).toBe(1);
  });

  test("fails publish without content", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(dashboardCaller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, cannot publish resource without content]`,
    );
  });

  // The channels number and anchor independently but share one object space: a publish of content the revision
  // Channel already holds is a row over that channel's object, so the unpublish that releases it must leave
  // What a revision still names — a bare delete of the channel's objects would be a revision that cannot be read
  test("unpublishes resource without collecting an object the revision channel still names", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await resourceCaller.saveResourceRevision({ id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const [revisionVersion, publishedVersion] = await mockContext.db.query.resourceVersionsInResource.findMany({
      columns: { hash: true },
      orderBy: { channel: "desc" },
      where: { resourceId: { eq: newResource.id } },
    });
    const publishedEventCount = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)?.length ?? 0;

    // The premise: the published version deduplicated against the revision's object
    expect(publishedVersion).toStrictEqual(revisionVersion);

    await dashboardCaller.unpublishResource({ id: newResource.id });

    await expect(dashboardCaller.readResourcePublication({ id: newResource.id })).resolves.toBeUndefined();
    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );
    await expect(resourceCaller.readSnapshotHistory({ id: newResource.id })).resolves.toHaveLength(1);
    // The revision still names the object, so the unpublish publishes no deletion for it
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)?.slice(publishedEventCount) ?? [];

    expect(blobDeletionEvents).toStrictEqual([]);
  });

  test("unpublishing removes the publication and its version rows in one transaction", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });

    await dashboardCaller.unpublishResource({ id: newResource.id });

    await expect(
      mockContext.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: newResource.id } } }),
    ).resolves.toBeUndefined();
    await expect(
      mockContext.db.query.resourceVersionsInResource.findMany({ where: { resourceId: { eq: newResource.id } } }),
    ).resolves.toStrictEqual([]);
  });

  // A sweep is bounded at the instant it is decided, so one published for a resource that has nothing published
  // Takes whatever a concurrent first publish has just cloned — and a delete that removed no row leaves the
  // Version sequence untouched, so nothing downstream can tell it happened. The whole tail is gated the same
  // Way, so the unpublish notification is counted here too: it would report a state change that never happened
  test("publishes nothing when nothing was published", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const publishedEventCount = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)?.length ?? 0;

    await dashboardCaller.unpublishResource({ id: newResource.id });

    expect(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)?.length ?? 0).toBe(publishedEventCount);
  });

  // The published version's objects are swept out from under its row, which the read answers as an absent version
  test("fails read published content with a swept snapshot", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await deleteDirectory(bucket);

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
    await expect(
      dashboardCaller.readPublishedVersionContent({ id: newResource.id, version: 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
  });

  test("fails read published content for unpublished resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );
  });

  test("a publish that lands after its resource is deleted leaves nothing publicly served", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    // The delete lands once the publish has passed its owner guard and stored its object, and before the batch that writes
    // The publication: the window a delete from another request can take
    interceptPut(async () => {
      await softDeleteResources(mockContext.db, eq(resourcesInResource.id, newResource.id));
    });

    await expect(dashboardCaller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );

    const publications = await mockContext.db
      .select()
      .from(resourcePublicationsInResource)
      .where(eq(resourcePublicationsInResource.resourceId, newResource.id));
    expect(publications).toStrictEqual([]);
    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
  });

  test("omits publish procedures for non-publishable types", () => {
    expect.hasAssertions();

    // A non-publishable type (Sheet) has no publish endpoints at all — capability gating, not just a guard.
    // The dashboardCaller proxy is permissive at runtime, so absence is asserted on the router's procedure record.
    const publishableProcedures = new Set(Object.keys(dashboardRouter._def.procedures));
    const nonPublishableProcedures = new Set(Object.keys(sheetRouter._def.procedures));

    // View counting rides the publishable capability, so it is gated by the same seam
    const publishProcedures = new Set([
      "publishResource",
      "readPublishedResourceContent",
      "readPublishedVersionContent",
      "readResourcePublication",
      "readResourceViewCount",
      "unpublishResource",
    ]);
    // Sheet has commands of its own beside the generic matrix, so this also checks that none of them is a publish procedure
    expect(publishableProcedures.difference(nonPublishableProcedures)).toStrictEqual(publishProcedures);
  });

  // A public read's view is written before the read returns, so the owner's count, which the owner read before it, is woken
  test("a public read's view is in the owner's count once the read returns", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.readResourceViewCount({ id: newResource.id });

    await dashboardCaller.readPublishedResourceContent(newResource.id);

    await expect(dashboardCaller.readResourceViewCount({ id: newResource.id })).resolves.toBe(1);
  });

  test("counts each public read", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const initialViewCount = await dashboardCaller.readResourceViewCount({ id: newResource.id });

    expect(initialViewCount).toBe(0);

    await dashboardCaller.readPublishedResourceContent(newResource.id);
    await dashboardCaller.readPublishedResourceContent(newResource.id);
    const viewCount = await dashboardCaller.readResourceViewCount({ id: newResource.id });

    // One person refreshing counts twice — these are views, never visitors
    expect(viewCount).toBe(2);
  });

  test("counts no views for unpublished resources", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );

    const viewCount = await dashboardCaller.readResourceViewCount({ id: newResource.id });

    expect(viewCount).toBe(0);
  });

  test("serves the public read when the view counter fails", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard();
    await dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    // The counter's write is the one a failing database would reject, so the failure is injected on the insert
    vi.spyOn(mockContext.db, "insert").mockImplementation(() => {
      throw new Error(" ");
    });
    vi.spyOn(console, "error").mockImplementation(noop);
    const { content } = await dashboardCaller.readPublishedResourceContent(newResource.id);

    // Telemetry must never break serving the page
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
    await expect(dashboardCaller.readResourceViewCount({ id: newResource.id })).resolves.toBe(0);
  });

  test("purges view counts with the resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.readPublishedResourceContent(newResource.id);
    const viewsBeforePurge = await readResourceViews(newResource.id);
    // Delete is soft, so view history survives the Recycle bin window — purge is what sweeps it
    await dashboardCaller.deleteResource({ id: newResource.id });
    await resourceCaller.purgeResource({ id: newResource.id });

    expect(viewsBeforePurge).not.toStrictEqual([]);
    // The resource row is gone, so its cascade is the only thing that can have cleared the counts
    await expect(readResourceViews(newResource.id)).resolves.toStrictEqual([]);
  });

  test("generates upload file presigned url entities", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const presignedUrlEntities = await webpageCaller.generateUploadFilePresignedUrlEntities({
      files: [{ hash, mimetype, size }],
      id: newResource.id,
    });

    const blobName = `${getResourceFilesDirectoryName(newResource.id)}/${hash}`;

    expect(presignedUrlEntities).toStrictEqual([
      { id: hash, isHeld: false, presignedUrl: expect.stringContaining(`/${blobName}?`) },
    ]);
  });

  // A webpage's media field offers its videos beside its images, so its upload takes them
  test("generates upload file presigned url entities for a webpage video", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const presignedUrlEntities = await webpageCaller.generateUploadFilePresignedUrlEntities({
      files: [{ hash, mimetype: MimeType.VideoMp4, size }],
      id: newResource.id,
    });

    const blobName = `${getResourceFilesDirectoryName(newResource.id)}/${hash}`;

    expect(presignedUrlEntities).toStrictEqual([
      { id: hash, isHeld: false, presignedUrl: expect.stringContaining(`/${blobName}?`) },
    ]);
  });

  // An svg can carry script, so no image a survey takes may be one, and the upload refuses it before a write url is signed
  test("fails generate upload file presigned url entities with an svg image on a survey", async () => {
    expect.hasAssertions();

    const newResource = await surveyCaller.createResource({ name });

    await expect(
      surveyCaller.generateUploadFilePresignedUrlEntities({
        files: [{ hash, mimetype: MimeType.Svg, size }],
        id: newResource.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, ResourceType.Survey, JSON.stringify({ mimetype: MimeType.Svg })).message}]`,
    );
  });

  // The same refusal on a webpage, whose list holds its videos beside its images, so the svg is refused against the images alone
  test("fails generate upload file presigned url entities with an svg image on a webpage", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });

    await expect(
      webpageCaller.generateUploadFilePresignedUrlEntities({
        files: [{ hash, mimetype: MimeType.Svg, size }],
        id: newResource.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, ResourceType.Webpage, JSON.stringify({ mimetype: MimeType.Svg })).message}]`,
    );
  });

  test("fails generate upload file presigned url entities with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const otherUserAuthSession = await createMockAuthSession(mockContext.db);

    await expect(
      createCallerFactory(webpageRouter)(
        await createMockContext(otherUserAuthSession),
      ).generateUploadFilePresignedUrlEntities({ files: [{ hash, mimetype, size }], id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("reads the files a resource holds, each with the type it was uploaded as", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const directory = getResourceFilesDirectoryName(newResource.id);
    await bucket.put(`${directory}/a`, Buffer.alloc(1), { httpMetadata: { contentType: MimeType.Png } });
    await bucket.put(`${directory}/b`, Buffer.alloc(2), { httpMetadata: { contentType: MimeType.VideoMp4 } });

    await expect(webpageCaller.readResourceFiles({ id: newResource.id })).resolves.toStrictEqual([
      { mimetype: MimeType.Png, size: 1, url: getResourceAssetUrl(`${directory}/a`) },
      { mimetype: MimeType.VideoMp4, size: 2, url: getResourceAssetUrl(`${directory}/b`) },
    ]);
  });

  test("a resource the owner does not hold lists no files", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const otherUserAuthSession = await createMockAuthSession(mockContext.db);

    await expect(
      createCallerFactory(webpageRouter)(await createMockContext(otherUserAuthSession)).readResourceFiles({
        id: newResource.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  // The file's blob is named by its hash and the delete hands that hash to the release path. No row names the file, so
  // The release decides to delete it and publishes the deletion; the Function performs it, so the blob is still here
  test("deleting a file no row names publishes its deletion", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const blobName = `${getResourceFilesDirectoryName(newResource.id)}/${hash}`;
    await bucket.put(blobName, Buffer.alloc(1));
    // The store stamps the upload with its own clock, not the pinned one, so the clock moves to the end of the grace
    // Window that stamp opens, which is when the release may delete the blob
    const upload = await bucket.head(blobName);
    assert.exists(upload);
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(upload.uploaded.getTime() + ASSET_GRACE_MS));

    await webpageCaller.deleteFile({ blobPath: hash, id: newResource.id });
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion) ?? [];

    expect(blobDeletionEvents).toStrictEqual([
      {
        blobNames: [blobName],
        decidedAt: new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS),
        storageBucket: StorageBucket.ResourceAssets,
      },
    ]);
    await expect(bucket.head(blobName)).resolves.not.toBeNull();
  });

  // A version naming an asset the bucket no longer holds is refused, so a publish that races a file's delete cannot
  // Store a page whose image is gone
  test("publishing a version whose asset was just deleted fails", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const blobName = `${getResourceFilesDirectoryName(newResource.id)}/${hash}`;
    await bucket.put(blobName, Buffer.alloc(1));
    await webpageCaller.saveResourceContent({
      content: new WebpageEditor({ content: [createTestImageNode(getResourceAssetUrl(blobName))] }),
      contentVersion: 0,
      id: newResource.id,
    });
    // Deleted after the working copy named it, as the file delete does before the release decides on it
    await bucket.delete(blobName);

    await expect(webpageCaller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Create, name: Resource, cannot store content naming a missing asset]`,
    );
  });

  test("publishing a version touches the assets it names", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const blobName = `${getResourceFilesDirectoryName(newResource.id)}/${hash}`;
    await bucket.put(blobName, Buffer.alloc(1));
    await webpageCaller.saveResourceContent({
      content: new WebpageEditor({ content: [createTestImageNode(getResourceAssetUrl(blobName))] }),
      contentVersion: 0,
      id: newResource.id,
    });

    await webpageCaller.publishResource({ id: newResource.id });

    // A touch rewrites the asset under its own name, stamping the time the publish touched it
    const touchedAsset = await bucket.head(blobName);
    assert.exists(touchedAsset);
    expect(touchedAsset.customMetadata).toHaveProperty("touchedAt");
  });

  test("omits file asset procedures for types without the capability", () => {
    expect.hasAssertions();

    const fileAssetsProcedures = new Set(Object.keys(webpageRouter._def.procedures));
    const nonFileAssetsProcedures = new Set(Object.keys(dashboardRouter._def.procedures));

    expect(fileAssetsProcedures.difference(nonFileAssetsProcedures)).toStrictEqual(
      new Set(["deleteFile", "generateUploadFilePresignedUrlEntities", "readResourceFiles"]),
    );
    expect(nonFileAssetsProcedures.difference(fileAssetsProcedures)).toStrictEqual(new Set());
  });

  // One type's row of the generic procedures every type's factory generates, run through that type's own caller. The row's
  // Type is a literal, so its caller and content are that type's own: a save takes the type's content, which no row widens
  // To the union of every type's content, as a single shared caller would have to accept
  const createResourceTypeRow = <TType extends ResourceType>(
    type: TType,
    createCaller: () => ResourceTypeCaller<TType>,
    createContent: () => ResourceContent<TType>,
    createChangedContent: () => ResourceContent<TType>,
  ) => ({
    defineTests: () => {
      test("creates a resource of its type", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });

        expect(newResource.name).toBe(name);
        expect(newResource.type).toBe(type);
        expect(newResource.contentVersion).toBe(0);
      });

      test("reads its resources, the one it created among them", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const { items } = await caller.readResources();

        expect(items.map(({ id }) => id)).toStrictEqual([newResource.id]);
      });

      test("updates the resource's name", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const updatedResource = await caller.updateResource({ id: newResource.id, name: updatedName });
        const { items } = await caller.readResources();

        expect(updatedResource.name).toBe(updatedName);
        expect(items.map((item) => item.name)).toStrictEqual([updatedName]);
      });

      test("deletes the resource", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const deletedResource = await caller.deleteResource({ id: newResource.id });
        const { items } = await caller.readResources();

        expect(deletedResource.id).toBe(newResource.id);
        expect(items).toStrictEqual([]);
      });

      test("saves content and reads it back", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const content = createContent();
        const savedResource = await caller.saveResourceContent({
          content,
          contentVersion: newResource.contentVersion,
          id: newResource.id,
        });
        const storedContent = await caller.readResourceContent({ id: newResource.id });

        expect(savedResource.contentVersion).toBe(1);
        expect(storedContent).toStrictEqual(jsonDateParse(JSON.stringify(content)));
      });

      test("saves a content delta that changes the stored content", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const savedResource = await caller.saveResourceContent({
          content: createContent(),
          contentVersion: newResource.contentVersion,
          id: newResource.id,
        });
        const baseline = await readJsonBlob(bucket, getContentBlobName(newResource.id));
        assert.exists(baseline);
        const changedContent = createChangedContent();
        // The delta is a plain zstd frame with the stored bytes as its dictionary, which is what the browser's encoder
        // Writes; node's own encoder stands in for it here
        const delta = zstdCompressSync(JSON.stringify(changedContent), { dictionary: baseline }).toBase64();
        const updatedResource = await caller.saveResourceContentDelta({
          baselineHash: savedResource.contentHash,
          contentVersion: savedResource.contentVersion,
          delta,
          id: newResource.id,
        });
        const storedContent = await caller.readResourceContent({ id: newResource.id });
        const storedBytes = await readJsonBlob(bucket, getContentBlobName(newResource.id));
        assert.exists(storedBytes);

        expect(savedResource.contentHash).toBe(createHash("sha256").update(baseline).digest("hex"));
        expect(updatedResource.contentVersion).toBe(2);
        expect(updatedResource.contentHash).toBe(createHash("sha256").update(storedBytes).digest("hex"));
        expect(storedContent).toStrictEqual(jsonDateParse(JSON.stringify(changedContent)));
      });

      test("saves staged content and releases its staging blob", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const content = createContent();
        const stagedHash = await stageContent(caller, newResource.id, gzipSync(JSON.stringify(content)));
        const updatedResource = await caller.saveStagedResourceContent({
          contentVersion: newResource.contentVersion,
          hash: stagedHash,
          id: newResource.id,
        });
        const storedContent = await caller.readResourceContent({ id: newResource.id });

        expect(updatedResource.contentVersion).toBe(1);
        expect(storedContent).toStrictEqual(jsonDateParse(JSON.stringify(content)));
        await expect(bucket.head(getStagingContentBlobName(newResource.id))).resolves.toBeNull();
      });
    },
    type,
  });
  // One file-assets type's row: the procedures its fileAssets capability generates beside the base ones
  const createFileAssetsRow = <TType extends FileAssetsResourceType>(
    type: TType,
    createCaller: () => FileAssetsCaller<TType>,
  ) => ({
    defineTests: () => {
      test("reads the files a resource holds, and releases the one it deletes", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        const blobName = `${getResourceFilesDirectoryName(newResource.id)}/${hash}`;
        await bucket.put(blobName, Buffer.alloc(1), { httpMetadata: { contentType: mimetype } });

        await expect(caller.readResourceFiles({ id: newResource.id })).resolves.toStrictEqual([
          { mimetype, size, url: getResourceAssetUrl(blobName) },
        ]);
        // The store stamps the upload with its own clock, so the clock moves to the end of the grace window that stamp
        // Opens, which is when the release may delete the blob
        const upload = await bucket.head(blobName);
        assert.exists(upload);
        vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(upload.uploaded.getTime() + ASSET_GRACE_MS));

        await caller.deleteFile({ blobPath: hash, id: newResource.id });

        expect(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)).toStrictEqual([
          {
            blobNames: [blobName],
            decidedAt: new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS),
            storageBucket: StorageBucket.ResourceAssets,
          },
        ]);
      });
    },
    type,
  });
  // One publishable type's row: the procedures its publishable capability generates beside the base ones
  const createPublishableRow = <TType extends PublishableResourceType>(
    type: TType,
    createCaller: () => PublishableCaller<TType>,
    createContent: () => ResourceContent<TType>,
  ) => ({
    defineTests: () => {
      test("publishes a resource, and reads its publication and published content back", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        await caller.saveResourceContent({
          content: createContent(),
          contentVersion: newResource.contentVersion,
          id: newResource.id,
        });
        const publication = await caller.publishResource({ id: newResource.id });
        const readPublication = await caller.readResourcePublication({ id: newResource.id });
        const { content: publishedContent, name: publishedName } = await caller.readPublishedResourceContent(
          newResource.id,
        );
        // The publish's activity write is best-effort and not awaited, so it is drained here before the cleanup
        await waitForSynchronizedFunctions();

        expect(publication.publishVersion).toBe(1);
        expect(readPublication?.publishVersion).toBe(1);
        expect(publishedName).toBe(name);
        await expect(caller.readPublishedVersionContent({ id: newResource.id, version: 1 })).resolves.toStrictEqual({
          content: publishedContent,
          name,
        });
        // The public read counts as a view of the type's own resource
        await expect(caller.readResourceViewCount({ id: newResource.id })).resolves.toBe(1);
      });

      test("unpublishes a resource, which then reads as unpublished", async () => {
        expect.hasAssertions();

        const caller = createCaller();

        const newResource = await caller.createResource({ name });
        await caller.saveResourceContent({
          content: createContent(),
          contentVersion: newResource.contentVersion,
          id: newResource.id,
        });
        await caller.publishResource({ id: newResource.id });
        await caller.unpublishResource({ id: newResource.id });

        await expect(caller.readResourcePublication({ id: newResource.id })).resolves.toBeUndefined();
      });
    },
    type,
  });

  // Each type's row, built from its literal so the row's caller and content are that type's own. The map's satisfies fails at
  // A type it leaves out, so a type cannot drop out of the matrix unnoticed
  const resourceTypeRowMap = {
    [ResourceType.Blueprint]: createResourceTypeRow(
      ResourceType.Blueprint,
      resourceTypeCallerMap[ResourceType.Blueprint],
      resourceTypeCreateContentMap[ResourceType.Blueprint],
      resourceTypeChangedContentMap[ResourceType.Blueprint],
    ),
    [ResourceType.Dashboard]: createResourceTypeRow(
      ResourceType.Dashboard,
      resourceTypeCallerMap[ResourceType.Dashboard],
      resourceTypeCreateContentMap[ResourceType.Dashboard],
      resourceTypeChangedContentMap[ResourceType.Dashboard],
    ),
    [ResourceType.Email]: createResourceTypeRow(
      ResourceType.Email,
      resourceTypeCallerMap[ResourceType.Email],
      resourceTypeCreateContentMap[ResourceType.Email],
      resourceTypeChangedContentMap[ResourceType.Email],
    ),
    [ResourceType.Note]: createResourceTypeRow(
      ResourceType.Note,
      resourceTypeCallerMap[ResourceType.Note],
      resourceTypeCreateContentMap[ResourceType.Note],
      resourceTypeChangedContentMap[ResourceType.Note],
    ),
    [ResourceType.Program]: createResourceTypeRow(
      ResourceType.Program,
      resourceTypeCallerMap[ResourceType.Program],
      resourceTypeCreateContentMap[ResourceType.Program],
      resourceTypeChangedContentMap[ResourceType.Program],
    ),
    [ResourceType.Sheet]: createResourceTypeRow(
      ResourceType.Sheet,
      resourceTypeCallerMap[ResourceType.Sheet],
      resourceTypeCreateContentMap[ResourceType.Sheet],
      resourceTypeChangedContentMap[ResourceType.Sheet],
    ),
    [ResourceType.Survey]: createResourceTypeRow(
      ResourceType.Survey,
      resourceTypeCallerMap[ResourceType.Survey],
      resourceTypeCreateContentMap[ResourceType.Survey],
      resourceTypeChangedContentMap[ResourceType.Survey],
    ),
    [ResourceType.TodoList]: createResourceTypeRow(
      ResourceType.TodoList,
      resourceTypeCallerMap[ResourceType.TodoList],
      resourceTypeCreateContentMap[ResourceType.TodoList],
      resourceTypeChangedContentMap[ResourceType.TodoList],
    ),
    [ResourceType.Webpage]: createResourceTypeRow(
      ResourceType.Webpage,
      resourceTypeCallerMap[ResourceType.Webpage],
      resourceTypeCreateContentMap[ResourceType.Webpage],
      resourceTypeChangedContentMap[ResourceType.Webpage],
    ),
    [ResourceType.Whiteboard]: createResourceTypeRow(
      ResourceType.Whiteboard,
      resourceTypeCallerMap[ResourceType.Whiteboard],
      resourceTypeCreateContentMap[ResourceType.Whiteboard],
      resourceTypeChangedContentMap[ResourceType.Whiteboard],
    ),
  } satisfies { [TType in ResourceType]: { type: TType } };
  // The file procedures' rows, one for each type with the fileAssets capability
  const fileAssetsRowMap = {
    [ResourceType.Email]: createFileAssetsRow(ResourceType.Email, resourceTypeCallerMap[ResourceType.Email]),
    [ResourceType.Note]: createFileAssetsRow(ResourceType.Note, resourceTypeCallerMap[ResourceType.Note]),
    [ResourceType.Survey]: createFileAssetsRow(ResourceType.Survey, resourceTypeCallerMap[ResourceType.Survey]),
    [ResourceType.Webpage]: createFileAssetsRow(ResourceType.Webpage, resourceTypeCallerMap[ResourceType.Webpage]),
    [ResourceType.Whiteboard]: createFileAssetsRow(
      ResourceType.Whiteboard,
      resourceTypeCallerMap[ResourceType.Whiteboard],
    ),
  } satisfies { [TType in FileAssetsResourceType]: { type: TType } };
  // The publish procedures' rows, one for each type with the publishable capability
  const publishableRowMap = {
    [ResourceType.Dashboard]: createPublishableRow(
      ResourceType.Dashboard,
      resourceTypeCallerMap[ResourceType.Dashboard],
      resourceTypeCreateContentMap[ResourceType.Dashboard],
    ),
    [ResourceType.Email]: createPublishableRow(
      ResourceType.Email,
      resourceTypeCallerMap[ResourceType.Email],
      resourceTypeCreateContentMap[ResourceType.Email],
    ),
    [ResourceType.Note]: createPublishableRow(
      ResourceType.Note,
      resourceTypeCallerMap[ResourceType.Note],
      resourceTypeCreateContentMap[ResourceType.Note],
    ),
    [ResourceType.Survey]: createPublishableRow(
      ResourceType.Survey,
      resourceTypeCallerMap[ResourceType.Survey],
      resourceTypeCreateContentMap[ResourceType.Survey],
    ),
    [ResourceType.Webpage]: createPublishableRow(
      ResourceType.Webpage,
      resourceTypeCallerMap[ResourceType.Webpage],
      resourceTypeCreateContentMap[ResourceType.Webpage],
    ),
  } satisfies { [TType in PublishableResourceType]: { type: TType } };

  // The generic procedures, run for every resource type through its own caller
  describe.each(Object.values(resourceTypeRowMap))("$type", ({ defineTests }) => {
    defineTests();
  });
  // The file procedures, which only the types with the fileAssets capability generate
  describe.each(Object.values(fileAssetsRowMap))("$type", ({ defineTests }) => {
    defineTests();
  });
  // The publish procedures, which only the types with the publishable capability generate
  describe.each(Object.values(publishableRowMap))("$type", ({ defineTests }) => {
    defineTests();
  });
});
