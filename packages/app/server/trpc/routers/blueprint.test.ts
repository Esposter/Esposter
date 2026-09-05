import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { blueprintRouter } from "@@/server/trpc/routers/blueprint";
import { programRouter } from "@@/server/trpc/routers/program";
import { AzureQueue, DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockServiceBusDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

// The blueprint router's own procedures: the deploy wiring, its validation and owner guards, and capture's
// Alias rewrite.
describe("blueprintRouter", () => {
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
    MockServiceBusDatabase.clear();
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

  // Deploy is the only content-write path whose content was never parsed by the type's own schema — the
  // Manifest carries every entry's content as `z.unknown()` — so this is the one that proves the after-save
  // Hook still receives the type's shape, and a deployed TodoList's future due dates get their reminders
  test("deploys a TodoList whose due dates still schedule their reminders", async () => {
    expect.hasAssertions();

    const dueAt = new Date(Date.now() + Temporal.Duration.from({ days: 1 }).total("milliseconds"));
    const item = new TodoListItem({ dueAt, name });
    const blueprint = await createBlueprint({
      entries: [{ content: { items: [item] }, key: "todo", name: "t", type: ResourceType.TodoList }],
      parameters: [],
    });
    const deployments = await caller.deployBlueprint({ id: blueprint.id, parameterValues: {} });
    const deployment = takeOne(deployments);
    await waitForSynchronizedFunctions();

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([
      { body: { dueAt, itemId: item.id, resourceId: deployment.resource.id }, scheduledEnqueueTimeUtc: dueAt },
    ]);
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

  test("deploys a nested blueprint entry without resolving its manifest's own tokens", async () => {
    expect.hasAssertions();

    const childManifest: BlueprintResource = {
      entries: [
        { content: {}, key: "leaf", name: "{{parameter:client}}", type: ResourceType.Program },
        {
          content: { audience: null, emailId: "{{entry:leaf}}", keyColumn: "", surveyId: "" },
          key: "inner",
          name: "inner",
          type: ResourceType.Program,
        },
      ],
      parameters: [],
    };
    const blueprint = await createBlueprint({
      entries: [{ content: childManifest, key: "child", name: "child", type: ResourceType.Blueprint }],
      parameters: [{ defaultValue: "", description: "", key: "client", title: "Client" }],
    });
    const deployments = await caller.deployBlueprint({ id: blueprint.id, parameterValues: { client: "Acme" } });
    const child = deployments.find(({ key }) => key === "child");
    assert.exists(child);
    const deployedManifest = await caller.readResourceContent({ id: child.resource.id });

    // The child's tokens name the child's own entries and parameters, so this deploy neither rejects
    // {{entry:leaf}} as an unknown reference nor substitutes its own id or parameter value into them
    expect(deployedManifest).toStrictEqual(childManifest);
  });

  test("captures a resource whose content was never written, and deploys it", async () => {
    expect.hasAssertions();

    const audience = await programCaller.createResource({ name: "a" });
    const blueprint = await caller.captureBlueprint({ ids: [audience.id], name });
    const deployments = await caller.deployBlueprint({ id: blueprint.id, parameterValues: {} });
    const deployment = deployments.find(({ key }) => key === "a");
    assert.exists(deployment);

    // A content-less source deploys to a content-less resource — the state it is actually in. Standing an
    // Empty object in instead would fail every deploy against the type's own schema
    await expect(programCaller.readResourceContent({ id: deployment.resource.id })).resolves.toBeUndefined();
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
