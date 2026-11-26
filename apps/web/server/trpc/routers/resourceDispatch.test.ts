import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";
import type { ResourcePublicationInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { connectAgentKey } from "#server/services/mcp/connectAgentKey.test";
import { getMcpTools } from "#server/services/mcp/getMcpTools";
import { createCallerFactory } from "#server/trpc/index";
import { resourceDispatchRouter } from "#server/trpc/routers/resourceDispatch";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { MimeType } from "#shared/models/file/MimeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { getResourceFilesDirectoryName, McpScope, WRITE_PRESIGNED_URL_DURATION_MS } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { createHash } from "node:crypto";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("resourceDispatchRouter", () => {
  const { getMockBucket, getMockContext } = setupResourceSuite(resourceDispatchRouter);
  let mockContext: Context;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  // A held address names its own bytes, which the upload checks before it trusts the blob
  const heldBytes = Buffer.alloc(1);
  const hash = createHash("sha256").update(heldBytes).digest("hex");
  const mimetype = MimeType.Png;
  const size = 1;
  const webpageEditor = new WebpageEditor({ description: "a" });

  beforeAll(async () => {
    mockContext = getMockContext();
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const readPublication = (resourceId: string) =>
    mockContext.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: resourceId } } });

  test("the upload address is asked for as a read, so a client that lets reads through lets it through", () => {
    expect.hasAssertions();

    const uploadTool = getMcpTools(resourceDispatchRouter, [McpScope.Resources]).find(
      (tool) => tool.name === "generateUploadFilePresignedUrlEntities",
    );

    expect(uploadTool?.annotations).toStrictEqual({ readOnlyHint: true });
  });

  test("a type that does not publish is refused in words", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const sheetResource = await sheetCaller.createResource({ name });

    await expect(
      callAgentTool("resource_publishResource", { id: sheetResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Invalid operation: Update, name: Sheet, does not publish]`);
    await expect(readPublication(sheetResource.id)).resolves.toBeUndefined();
  });

  test("an agent publishes and unpublishes a resource of a publishing type", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    const publication = await callAgentTool<ResourcePublicationInResource>("resource_publishResource", {
      id: webpageResource.id,
    });
    const publishedAfterPublish = await readPublication(webpageResource.id);
    await callAgentTool("resource_unpublishResource", { id: webpageResource.id });
    const publishedAfterUnpublish = await readPublication(webpageResource.id);

    expect(publication.resourceId).toStrictEqual(webpageResource.id);
    expect(publishedAfterPublish).toBeDefined();
    // The removal is kept as a tombstone, which is what a client reads its own removal from
    expect(publishedAfterUnpublish?.deletedAt).not.toBeNull();
  });

  test("an agent is given a write address for the file's hash, and the store holds nothing until the bytes are sent", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    const presignedUrlEntities = await callAgentTool<ResourceFilePresignedUrlEntity[]>(
      "resource_generateUploadFilePresignedUrlEntities",
      { files: [{ hash, mimetype, size }], id: webpageResource.id },
    );
    const blobName = `${getResourceFilesDirectoryName(webpageResource.id)}/${hash}`;
    const { presignedUrl } = takeOne(presignedUrlEntities);
    const parsedPresignedUrl = new URL(presignedUrl);

    expect(presignedUrlEntities).toStrictEqual([{ id: hash, isHeld: false, presignedUrl }]);
    expect(parsedPresignedUrl.pathname).toContain(`/${blobName}`);
    expect(parsedPresignedUrl.searchParams.get("X-Amz-Expires")).toBe(String(WRITE_PRESIGNED_URL_DURATION_MS / 1000));
    await expect(getMockBucket().head(blobName)).resolves.toBeNull();
  });

  test("an agent uploads a file before its address expires", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getResourceFilesDirectoryName(webpageResource.id)}/${hash}`;
    const requestUploadAddress = () =>
      callAgentTool<ResourceFilePresignedUrlEntity[]>("resource_generateUploadFilePresignedUrlEntities", {
        files: [{ hash, mimetype, size }],
        id: webpageResource.id,
      });

    await expect(requestUploadAddress()).resolves.toStrictEqual([
      { id: hash, isHeld: false, presignedUrl: expect.stringContaining(`/${blobName}?`) },
    ]);
    // The agent's shell sends the bytes inside the address's hour, and the blob lands under the file's hash
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(WRITE_PRESIGNED_URL_DURATION_MS / 2));
    await getMockBucket().put(blobName, heldBytes);

    await expect(requestUploadAddress()).resolves.toStrictEqual([{ id: hash, isHeld: true, presignedUrl: "" }]);
  });
});
