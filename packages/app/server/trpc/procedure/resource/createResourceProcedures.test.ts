import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

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
    // Cascade removes any resource_publications rows too
    await mockContext.db.delete(resources);
  });

  test("creates resource", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.name).toBe(name);
    expect(newResource.type).toBe(ResourceType.Dashboard);
    expect(newResource.contentVersion).toBe(0);
  });

  test("reads resources", async () => {
    expect.hasAssertions();

    const readResources = await caller.readResources();

    expect(readResources.items).toStrictEqual([]);

    const newResource = await caller.createResource({ name });
    const newReadResources = await caller.readResources();

    expect(newReadResources.items).toStrictEqual([newResource]);
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

    await expect(caller.readResourcePublication({ id: newResource.id })).resolves.toBeUndefined();

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

    await expect(caller.readResourcePublication({ id: newResource.id })).resolves.toBeUndefined();
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
    const nonPublishableProcedures = Object.keys(tableEditorRouter._def.procedures);

    expect(publishableProcedures).toContain("publishResource");
    expect(nonPublishableProcedures).not.toContain("publishResource");
    expect(nonPublishableProcedures).not.toContain("unpublishResource");
    expect(nonPublishableProcedures).not.toContain("readResourcePublication");
    expect(nonPublishableProcedures).not.toContain("readPublishedResourceContent");
  });
});
