import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { blueprintRouter } from "@@/server/trpc/routers/blueprint";
import { programRouter } from "@@/server/trpc/routers/program";
import { DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

// The generic resource-procedure matrix is covered in createResourceProcedures.test.ts; here the blueprint
// Router's own procedures: the deploy wiring, its validation/owner guards, and capture's alias rewrite.
describe("blueprint", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["blueprint"]>;
  let programCaller: DecorateRouterRecord<TRPCRouter["program"]>;
  const name = "name";
  // Two program entries: the funnel binds the audience's created id through an {{entry:audience}} alias
  const wiredManifest: BlueprintResource = {
    entries: [
      { content: {}, key: "audience", name: "a", type: ResourceType.Program },
      {
        content: { audience: null, emailId: "{{entry:audience}}", keyColumn: "", surveyId: "" },
        key: "funnel",
        name: "b",
        type: ResourceType.Program,
      },
    ],
    parameters: [],
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(blueprintRouter)(mockContext);
    programCaller = createCallerFactory(programRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(resources);
  });

  const createBlueprint = async (manifest: BlueprintResource) => {
    const blueprint = await caller.createResource({ name });
    await caller.saveResourceContent({ content: manifest, contentVersion: blueprint.contentVersion, id: blueprint.id });
    return blueprint;
  };
  const createBoundPrograms = async () => {
    const audience = await programCaller.createResource({ name: "a" });
    const funnel = await programCaller.createResource({ name: "b" });
    await programCaller.saveResourceContent({
      content: { audience: null, emailId: audience.id, keyColumn: "", surveyId: "" },
      contentVersion: funnel.contentVersion,
      id: funnel.id,
    });
    return { audience, funnel };
  };

  test("creates", async () => {
    expect.hasAssertions();

    const blueprint = await caller.createResource({ name });

    expect(blueprint.type).toBe(ResourceType.Blueprint);
  });

  test("deploys a manifest, creating and wiring every entry", async () => {
    expect.hasAssertions();

    const blueprint = await createBlueprint(wiredManifest);
    const deployments = await caller.deployBlueprint({ id: blueprint.id, parameterValues: {} });
    const audience = deployments.find(({ key }) => key === "audience");
    const funnel = deployments.find(({ key }) => key === "funnel");
    assert.exists(audience);
    assert.exists(funnel);
    const funnelContent = await programCaller.readResourceContent({ id: funnel.resource.id });

    expect(deployments).toHaveLength(2);
    expect(funnel.resource.type).toBe(ResourceType.Program);
    // The {{entry:audience}} alias resolved to the audience entry's real created id
    expect(funnelContent?.emailId).toBe(audience.resource.id);
  });

  test("fails deploy with invalid entry content", async () => {
    expect.hasAssertions();

    const blueprint = await createBlueprint({
      entries: [{ content: { emailId: "abc" }, key: "audience", name: "a", type: ResourceType.Program }],
      parameters: [],
    });

    await expect(
      caller.deployBlueprint({ id: blueprint.id, parameterValues: {} }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "invalid content for entry audience").message}]`,
    );
    const programs = await programCaller.readResources();

    // Pre-validation runs before any insert, so a rejected deploy creates nothing
    expect(programs.items).toStrictEqual([]);
  });

  test("fails deploy with non-existent id", async () => {
    expect.hasAssertions();

    await expect(
      caller.deployBlueprint({ id: crypto.randomUUID(), parameterValues: {} }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("captures selected resources, rewriting cross-resource ids to aliases", async () => {
    expect.hasAssertions();

    const { audience, funnel } = await createBoundPrograms();
    const blueprint = await caller.captureBlueprint({ ids: [audience.id, funnel.id], name });
    const manifest = await caller.readResourceContent({ id: blueprint.id });
    assert.exists(manifest);
    const funnelEntry = manifest.entries.find(({ name: entryName }) => entryName === "b");
    assert.exists(funnelEntry);

    expect(blueprint.type).toBe(ResourceType.Blueprint);
    // The funnel's emailId pointed at the audience's id, now rewritten to that entry's alias token
    expect((funnelEntry.content as { emailId: string }).emailId).toBe(buildBlueprintEntryToken("a"));
  });

  test("fails capture with non-existent id", async () => {
    expect.hasAssertions();

    await expect(
      caller.captureBlueprint({ ids: [crypto.randomUUID()], name }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("round-trips: a captured set deploys back to an isomorphically wired set", async () => {
    expect.hasAssertions();

    const { audience, funnel } = await createBoundPrograms();
    const blueprint = await caller.captureBlueprint({ ids: [audience.id, funnel.id], name });
    const deployments = await caller.deployBlueprint({ id: blueprint.id, parameterValues: {} });
    const deployedAudience = deployments.find(({ key }) => key === "a");
    const deployedFunnel = deployments.find(({ key }) => key === "b");
    assert.exists(deployedAudience);
    assert.exists(deployedFunnel);
    const funnelContent = await programCaller.readResourceContent({ id: deployedFunnel.resource.id });

    // The deployed funnel binds the deployed audience — the original wiring, not the original ids
    expect(funnelContent?.emailId).toBe(deployedAudience.resource.id);
  });
});
