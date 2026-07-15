import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { getBlobName } from "@esposter/db";
import { AzureContainer, DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic resource-procedure matrix is covered ONCE here (via a publishable representative type);
// Per-type router tests only assert their own wiring (correct ResourceType + content schema round-trip).
describe("createResourceProcedures", () => {
  let mockContext: Context;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  // Dashboard is the publishable representative; Webpage is the FileAssets one
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const updatedName = "updatedName";
  const filename = "filename";
  const mimetype = "mimetype";

  beforeAll(async () => {
    mockContext = await createMockContext();
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    // Cascade removes any resource_publications rows too
    await mockContext.db.delete(resources);
  });

  test("creates resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    expect(newResource.name).toBe(name);
    expect(newResource.type).toBe(ResourceType.Dashboard);
    expect(newResource.contentVersion).toBe(0);
  });

  test("reads resources with publication state", async () => {
    expect.hasAssertions();

    const readResources = await dashboardCaller.readResources();

    expect(readResources.items).toStrictEqual([]);

    const newResource = await dashboardCaller.createResource({ name });
    const newReadResources = await dashboardCaller.readResources();

    expect(newReadResources.items).toStrictEqual([{ ...newResource, publication: null }]);

    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const publishedReadResources = await dashboardCaller.readResources();

    expect(publishedReadResources.items[0]?.publication?.publishVersion).toBe(1);
  });

  test("updates resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const updatedResource = await dashboardCaller.updateResource({ id: newResource.id, name: updatedName });

    expect(updatedResource.name).toBe(updatedName);
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      dashboardCaller.updateResource({ id: newResource.id, name: updatedName }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const deletedResource = await dashboardCaller.deleteResource({ id: newResource.id });

    expect(deletedResource.id).toBe(newResource.id);

    const readResources = await dashboardCaller.readResources();

    expect(readResources.items).toStrictEqual([]);
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Update,
          DatabaseEntityType.Resource,
          "cannot save resource content with old content version",
        ).message
      }]`,
    );
  });

  test("fails save content with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id }),
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
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Update,
          DatabaseEntityType.Resource,
          "cannot publish resource without content",
        ).message
      }]`,
    );
  });

  test("unpublishes resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.unpublishResource({ id: newResource.id });

    const publication = await dashboardCaller.readResourcePublication({ id: newResource.id });

    expect(publication).toBeUndefined();
    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: NOT_FOUND]`);
  });

  test("fails read published content for unpublished resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: NOT_FOUND]`);
  });

  test("omits publish procedures for non-publishable types", () => {
    expect.hasAssertions();

    // A non-publishable type (Table) has no publish endpoints at all — capability gating, not just a guard.
    // The caller proxy is permissive at runtime, so absence is asserted on the router's procedure record.
    const publishableProcedures = Object.keys(dashboardRouter._def.procedures);
    const nonPublishableProcedures = Object.keys(sheetRouter._def.procedures);

    expect(publishableProcedures).toContain("publishResource");
    expect(nonPublishableProcedures).not.toContain("publishResource");
    expect(nonPublishableProcedures).not.toContain("unpublishResource");
    expect(nonPublishableProcedures).not.toContain("readResourcePublication");
    expect(nonPublishableProcedures).not.toContain("readPublishedResourceContent");
  });

  test("generates upload file sas entities", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const sasEntities = await webpageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype }],
      id: newResource.id,
    });

    expect(sasEntities).toHaveLength(1);
  });

  test("generates download file sas urls", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const sasUrls = await webpageCaller.generateDownloadFileSasUrls({
      files: [{ filename, id: crypto.randomUUID(), mimetype }],
      id: newResource.id,
    });

    expect(sasUrls).toHaveLength(1);
  });

  test("fails generate upload file sas entities with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      webpageCaller.generateUploadFileSasEntities({ files: [{ filename, mimetype }], id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes file", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const blobPath = `files/${getBlobName(crypto.randomUUID(), filename)}`;
    const blobName = `${newResource.id}/${blobPath}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));

    await webpageCaller.deleteFile({ blobPath, id: newResource.id });

    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(blobName)).toBe(false);
  });

  test("deleteFile is idempotent", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const blobPath = `files/${getBlobName(crypto.randomUUID(), filename)}`;

    await webpageCaller.deleteFile({ blobPath, id: newResource.id });

    await expect(webpageCaller.deleteFile({ blobPath, id: newResource.id })).resolves.toBeUndefined();
  });

  test("omits file asset procedures for types without the capability", () => {
    expect.hasAssertions();

    const fileAssetsProcedures = Object.keys(webpageRouter._def.procedures);
    const nonFileAssetsProcedures = Object.keys(dashboardRouter._def.procedures);

    expect(fileAssetsProcedures).toContain("generateUploadFileSasEntities");
    expect(nonFileAssetsProcedures).not.toContain("generateUploadFileSasEntities");
    expect(nonFileAssetsProcedures).not.toContain("generateDownloadFileSasUrls");
    expect(nonFileAssetsProcedures).not.toContain("deleteFile");
  });
});
