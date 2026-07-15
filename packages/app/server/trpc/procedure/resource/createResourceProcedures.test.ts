import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Clause } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  DatabaseEntityType,
  resources,
  ResourceType,
  ResourceViewEntity,
} from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, noop, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableClient, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The view-count assertions read the counter table directly, so the mock must be registered in this
// Module graph — createMockContext's registration does not reach a direct import
vi.mock(
  import("@@/server/composables/azure/table/useTableClient"),
  () => import("@@/server/composables/azure/table/useTableClient.test"),
);

// The generic resource-procedure matrix is covered ONCE here (via a publishable representative type);
// Per-type router tests only assert their own wiring (correct ResourceType + content schema round-trip).
describe("createResourceProcedures", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(dashboardRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    // Cascade removes any resource_publications rows too
    await mockContext.db.delete(resources);
    vi.restoreAllMocks();
  });

  test("creates resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.name).toBe(name);
    expect(newResource.type).toBe(ResourceType.Dashboard);
    expect(newResource.contentVersion).toBe(0);
  });

  test("reads resources with publication state", async () => {
    expect.hasAssertions();

    const readResources = await caller.readResources();

    expect(readResources.items).toStrictEqual([]);

    const newResource = await caller.createResource({ name });
    const newReadResources = await caller.readResources();

    expect(newReadResources.items).toStrictEqual([{ ...newResource, publication: null }]);

    await caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const publishedReadResources = await caller.readResources();

    expect(publishedReadResources.items[0]?.publication?.publishVersion).toBe(1);
  });

  test("updates resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const updatedResource = await caller.updateResource({ id: newResource.id, name: updatedName });

    expect(updatedResource.name).toBe(updatedName);
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.updateResource({ id: newResource.id, name: updatedName }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const deletedResource = await caller.deleteResource({ id: newResource.id });

    expect(deletedResource.id).toBe(newResource.id);

    const readResources = await caller.readResources();

    expect(readResources.items).toStrictEqual([]);
  });

  test("reads undefined content for new resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toBeUndefined();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const updatedResource = await caller.saveResourceContent({
      content: dashboard,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    expect(updatedResource.contentVersion).toBe(1);

    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("fails save content with old content version", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const dashboard = new Dashboard();
    await caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });

    await expect(
      caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id }),
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

    const newResource = await caller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes and reads published content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    await caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    const publication = await caller.publishResource({ id: newResource.id });

    expect(publication.publishVersion).toBe(1);

    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("bumps publish version on republish", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const republication = await caller.publishResource({ id: newResource.id });

    expect(republication.publishVersion).toBe(2);
  });

  test("reads publication state", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const publication = await caller.readResourcePublication({ id: newResource.id });

    expect(publication).toBeUndefined();

    await caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });

    expect((await caller.readResourcePublication({ id: newResource.id }))?.publishVersion).toBe(1);
  });

  test("fails publish without content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    await expect(caller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
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

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    await caller.unpublishResource({ id: newResource.id });

    const publication = await caller.readResourcePublication({ id: newResource.id });

    expect(publication).toBeUndefined();
    await expect(caller.readPublishedResourceContent(newResource.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: NOT_FOUND]`,
    );
  });

  test("fails read published content for unpublished resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    await expect(caller.readPublishedResourceContent(newResource.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: NOT_FOUND]`,
    );
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
    // View counting rides the publishable capability, so it is gated by the same seam
    expect(publishableProcedures).toContain("readResourceViewCount");
    expect(nonPublishableProcedures).not.toContain("readResourceViewCount");
  });

  test("counts each public read", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const initialViewCount = await caller.readResourceViewCount({ id: newResource.id });

    expect(initialViewCount).toBe(0);

    await caller.readPublishedResourceContent(newResource.id);
    await caller.readPublishedResourceContent(newResource.id);
    const viewCount = await caller.readResourceViewCount({ id: newResource.id });

    // One person refreshing counts twice — these are views, never visitors
    expect(viewCount).toBe(2);
  });

  test("counts no views for unpublished resources", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    await expect(caller.readPublishedResourceContent(newResource.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: NOT_FOUND]`,
    );

    const viewCount = await caller.readResourceViewCount({ id: newResource.id });

    expect(viewCount).toBe(0);
  });

  test("serves the public read when the view counter fails", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const dashboard = new Dashboard();
    await caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    // The table client is constructed per call, so the failure is injected on the prototype
    vi.spyOn(MockTableClient.prototype, "upsertEntity").mockRejectedValue(new Error(""));
    vi.spyOn(console, "error").mockImplementation(noop);
    const { content } = await caller.readPublishedResourceContent(newResource.id);

    // Telemetry must never break serving the page
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
    expect(await caller.readResourceViewCount({ id: newResource.id })).toBe(0);
  });

  test("deletes view counts with the resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    await caller.readPublishedResourceContent(newResource.id);
    await caller.deleteResource({ id: newResource.id });
    // The resource row is gone, so the cleared partition can only be observed against the table
    const clauses: Clause<ResourceViewEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: newResource.id },
    ];
    const resourceViewClient = await useTableClient(AzureTable.ResourceViews);
    const resourceViews = await getTopNEntities(resourceViewClient, AZURE_MAX_PAGE_SIZE, ResourceViewEntity, {
      filter: serializeClauses(clauses),
    });

    expect(resourceViews).toStrictEqual([]);
  });
});
