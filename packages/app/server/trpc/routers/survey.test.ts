import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { AzureEntityType, resources, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { randomUUID } from "node:crypto";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic resource-procedure matrix is covered once in createResourceProcedures.test.ts;
// Here only the router wiring (resource type + content round-trip) and the survey-specific procedures.
describe("survey", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";
  const model = "model";
  const updatedModel = "updatedModel";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(surveyRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Survey);

    await caller.saveResourceContent({
      content: { model },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual({ model });
  });

  test("hides unpublished surveys from respondents", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    await expect(caller.readPublishedResourceContent(newResource.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: NOT_FOUND]`,
    );
  });

  test("serves the published snapshot to respondents, not later edits", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    await caller.saveResourceContent({
      content: { model: updatedModel },
      contentVersion: newResource.contentVersion + 1,
      id: newResource.id,
    });
    const { content } = await caller.readPublishedResourceContent(newResource.id);

    expect(content).toStrictEqual({ model });
  });

  test("creates and reads survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 1 },
      partitionKey: newResource.id,
      rowKey: randomUUID(),
    });
    const readSurveyResponse = await caller.readSurveyResponse({
      partitionKey: newSurveyResponse.partitionKey,
      rowKey: newSurveyResponse.rowKey,
    });

    expect(readSurveyResponse).toStrictEqual(newSurveyResponse);
  });

  test("reads null survey response with non-existent id", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const readSurveyResponse = await caller.readSurveyResponse({
      partitionKey: newResource.id,
      rowKey: randomUUID(),
    });

    expect(readSurveyResponse).toBeNull();
  });

  test("updates survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      partitionKey: newResource.id,
      rowKey: randomUUID(),
    });
    const updatedSurveyResponse = await caller.updateSurveyResponse({
      model: { satisfaction: 1 },
      modelVersion: newSurveyResponse.modelVersion,
      partitionKey: newSurveyResponse.partitionKey,
      rowKey: newSurveyResponse.rowKey,
    });

    expect(updatedSurveyResponse.model).toStrictEqual({ satisfaction: 1 });
    expect(updatedSurveyResponse.modelVersion).toBe(newSurveyResponse.modelVersion + 1);
  });

  test("fails update survey response with duplicate model", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      partitionKey: newResource.id,
      rowKey: randomUUID(),
    });

    await expect(
      caller.updateSurveyResponse({
        model: newSurveyResponse.model,
        modelVersion: newSurveyResponse.modelVersion,
        partitionKey: newSurveyResponse.partitionKey,
        rowKey: newSurveyResponse.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, AzureEntityType.SurveyResponse, "duplicate model").message}]`,
    );
  });

  test("fails update survey response with old model version", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      partitionKey: newResource.id,
      rowKey: randomUUID(),
    });
    await caller.updateSurveyResponse({
      model: { satisfaction: 1 },
      modelVersion: newSurveyResponse.modelVersion,
      partitionKey: newSurveyResponse.partitionKey,
      rowKey: newSurveyResponse.rowKey,
    });

    await expect(
      caller.updateSurveyResponse({
        model: { satisfaction: 2 },
        modelVersion: newSurveyResponse.modelVersion,
        partitionKey: newSurveyResponse.partitionKey,
        rowKey: newSurveyResponse.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Update,
          AzureEntityType.SurveyResponse,
          "cannot update survey response model with old model version",
        ).message
      }]`,
    );
  });
});
