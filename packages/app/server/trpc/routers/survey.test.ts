import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { closedSurveyErrorReason, invalidParticipantTokenErrorReason } from "@@/server/services/survey/constants";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { createBoundProgram } from "@@/server/trpc/routers/createBoundProgram.test";
import { programRouter } from "@@/server/trpc/routers/program";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { AzureEntityType, AzureTable, resources, ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

// The generic resource-procedure matrix is covered once in createResourceProcedures.test.ts;
// Here only the router wiring (resource type + content round-trip) and the survey-specific procedures.
describe("survey", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let programCaller: DecorateRouterRecord<TRPCRouter["program"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";
  const model = "model";
  const updatedModel = "updatedModel";
  const settings = surveySettingsSchema.parse({});
  const identifiedSettings = { ...settings, responseMode: SurveyResponseMode.Identified };
  const closedMessage = "closedMessage";
  const closedSettings = { ...settings, closedMessage, isAcceptingResponses: false };
  const keyValue = "keyValue";
  const invalidParticipantTokenErrorMessage = new InvalidOperationError(
    Operation.Create,
    AzureEntityType.SurveyResponse,
    invalidParticipantTokenErrorReason,
  ).message;
  const closedSurveyErrorMessage = new InvalidOperationError(
    Operation.Create,
    AzureEntityType.SurveyResponse,
    closedSurveyErrorReason,
  ).message;
  // An Identified survey plus a program bound to it, returning the survey and its one valid token
  const setupIdentifiedSurvey = async () => {
    const survey = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model, settings: identifiedSettings } satisfies SurveyResource,
      contentVersion: survey.contentVersion,
      id: survey.id,
    });
    const program = await createBoundProgram({
      keyValues: [keyValue],
      name,
      programCaller,
      sheetCaller,
      surveyId: survey.id,
    });
    const [participant] = await programCaller.generateProgramParticipants({ id: program.id });
    assert.exists(participant);
    return { survey, token: participant.token };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(surveyRouter)(mockContext);
    programCaller = createCallerFactory(programRouter)(mockContext);
    resourceCaller = createCallerFactory(resourceRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
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
      content: { model, settings },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual({ model, settings });
  });

  test("clears its response partition when the resource is purged", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model, settings },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    // Delete is soft, so responses survive the Recycle bin window and restore keeps them intact
    await caller.deleteResource({ id: newResource.id });

    expect(MockTableDatabase.get(AzureTable.SurveyResponses)?.size).toBe(1);

    // Respondents' answers are the survey's own data, so purge destroys them instead of orphaning forever
    await resourceCaller.purgeResource({ id: newResource.id });

    expect(MockTableDatabase.get(AzureTable.SurveyResponses)?.size).toBe(0);
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
      content: { model, settings },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    await caller.saveResourceContent({
      content: { model: updatedModel, settings },
      contentVersion: newResource.contentVersion + 1,
      id: newResource.id,
    });
    const { content } = await caller.readPublishedResourceContent(newResource.id);

    expect(content.model).toBe(model);
  });

  test("creates and reads survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 1 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
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
      rowKey: crypto.randomUUID(),
    });

    expect(readSurveyResponse).toBeNull();
  });

  test("updates survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    const updatedSurveyResponse = await caller.updateSurveyResponse({
      model: { satisfaction: 1 },
      modelVersion: newSurveyResponse.modelVersion,
      participantToken: "",
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
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    await expect(
      caller.updateSurveyResponse({
        model: newSurveyResponse.model,
        modelVersion: newSurveyResponse.modelVersion,
        participantToken: "",
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
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    await caller.updateSurveyResponse({
      model: { satisfaction: 1 },
      modelVersion: newSurveyResponse.modelVersion,
      participantToken: "",
      partitionKey: newSurveyResponse.partitionKey,
      rowKey: newSurveyResponse.rowKey,
    });

    await expect(
      caller.updateSurveyResponse({
        model: { satisfaction: 2 },
        modelVersion: newSurveyResponse.modelVersion,
        participantToken: "",
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

  test("stores no token for an anonymous survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    // A stale participant link into an anonymous survey still works, it just carries nothing
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: crypto.randomUUID(),
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    expect(newSurveyResponse.participantToken).toBe("");
  });

  test(`${SurveyResponseMode.Identified}: accepts a valid token and stores it`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });

    expect(newSurveyResponse.participantToken).toBe(token);
  });

  test(`fails create with missing token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const { survey } = await setupIdentifiedSurvey();

    await expect(
      caller.createSurveyResponse({
        model: { satisfaction: 0 },
        participantToken: "",
        partitionKey: survey.id,
        rowKey: crypto.randomUUID(),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${invalidParticipantTokenErrorMessage}]`);
  });

  test(`fails create with forged token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const { survey } = await setupIdentifiedSurvey();

    await expect(
      caller.createSurveyResponse({
        model: { satisfaction: 0 },
        participantToken: crypto.randomUUID(),
        partitionKey: survey.id,
        rowKey: crypto.randomUUID(),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${invalidParticipantTokenErrorMessage}]`);
  });

  test(`fails create with another survey's token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const { survey } = await setupIdentifiedSurvey();
    // A token issued by a program bound to a different survey is as good as a forgery
    const { token: otherToken } = await setupIdentifiedSurvey();

    await expect(
      caller.createSurveyResponse({
        model: { satisfaction: 0 },
        participantToken: otherToken,
        partitionKey: survey.id,
        rowKey: crypto.randomUUID(),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${invalidParticipantTokenErrorMessage}]`);
  });

  test(`${SurveyResponseMode.Identified}: resumes with the same token`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const updatedSurveyResponse = await caller.updateSurveyResponse({
      model: { satisfaction: 1 },
      modelVersion: newSurveyResponse.modelVersion,
      participantToken: token,
      partitionKey: survey.id,
      rowKey: newSurveyResponse.rowKey,
    });

    expect(updatedSurveyResponse.participantToken).toBe(token);
  });

  test(`fails update with swapped token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const survey = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model, settings: identifiedSettings } satisfies SurveyResource,
      contentVersion: survey.contentVersion,
      id: survey.id,
    });
    // Two recipients of the same program: both tokens are valid, but a response belongs to exactly one
    const program = await createBoundProgram({
      keyValues: [keyValue, `${keyValue} `],
      name,
      programCaller,
      sheetCaller,
      surveyId: survey.id,
    });
    const participants = await programCaller.generateProgramParticipants({ id: program.id });
    const [firstParticipant, secondParticipant] = participants;
    assert.exists(firstParticipant);
    assert.exists(secondParticipant);
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: firstParticipant.token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });

    await expect(
      caller.updateSurveyResponse({
        model: { satisfaction: 1 },
        modelVersion: newSurveyResponse.modelVersion,
        participantToken: secondParticipant.token,
        partitionKey: survey.id,
        rowKey: newSurveyResponse.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${invalidParticipantTokenErrorMessage}]`);
  });

  test(`switching ${SurveyResponseMode.Identified} to ${SurveyResponseMode.Anonymous} applies on the next write`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    // Settings are live working state, so no re-publish is involved in the switch
    await caller.saveResourceContent({
      content: { model, settings } satisfies SurveyResource,
      contentVersion: survey.contentVersion + 1,
      id: survey.id,
    });
    const anonymousSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 1 },
      participantToken: "",
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const existingSurveyResponse = await caller.readSurveyResponse({
      partitionKey: survey.id,
      rowKey: newSurveyResponse.rowKey,
    });

    expect(anonymousSurveyResponse.participantToken).toBe("");
    // The mode governs the write boundary from now on; it never mutates responses already stored
    expect(existingSurveyResponse?.participantToken).toBe(token);
  });

  test(`updating an ${SurveyResponseMode.Identified}-era response after switching to ${SurveyResponseMode.Anonymous} keeps its token`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    await caller.saveResourceContent({
      content: { model, settings } satisfies SurveyResource,
      contentVersion: survey.contentVersion + 1,
      id: survey.id,
    });
    const updatedSurveyResponse = await caller.updateSurveyResponse({
      model: { satisfaction: 1 },
      modelVersion: newSurveyResponse.modelVersion,
      participantToken: "",
      partitionKey: survey.id,
      rowKey: newSurveyResponse.rowKey,
    });

    // The funnel joins participants × responses by token, so an Anonymous-mode edit must not erase who answered
    expect(updatedSurveyResponse.participantToken).toBe(token);
  });

  test("fails create with closed survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model, settings: closedSettings } satisfies SurveyResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await expect(
      caller.createSurveyResponse({
        model: { satisfaction: 0 },
        participantToken: "",
        partitionKey: newResource.id,
        rowKey: crypto.randomUUID(),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${closedSurveyErrorMessage}]`);
  });

  test("fails create for a recycle-binned survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.deleteResource({ id: newResource.id });

    await expect(
      caller.createSurveyResponse({
        model: { satisfaction: 0 },
        participantToken: "",
        partitionKey: newResource.id,
        rowKey: crypto.randomUUID(),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: NOT_FOUND]`);
  });

  test("fails update with closed survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    // An in-flight respondent — form open when the survey closed — gets the rejection on submit
    await caller.saveResourceContent({
      content: { model, settings: closedSettings } satisfies SurveyResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await expect(
      caller.updateSurveyResponse({
        model: { satisfaction: 1 },
        modelVersion: newSurveyResponse.modelVersion,
        participantToken: "",
        partitionKey: newResource.id,
        rowKey: newSurveyResponse.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${closedSurveyErrorMessage}]`);
  });

  test("serves the live closed flag over the published snapshot", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model, settings } satisfies SurveyResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    await caller.saveResourceContent({
      content: { model: updatedModel, settings: closedSettings } satisfies SurveyResource,
      contentVersion: newResource.contentVersion + 1,
      id: newResource.id,
    });
    const { content } = await caller.readPublishedResourceContent(newResource.id);

    // The model stays the immutable snapshot while the settings are the live ones
    expect(content.model).toBe(model);
    expect(content.settings).toStrictEqual(closedSettings);
  });

  test("reopening accepts responses again", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: { model, settings: closedSettings } satisfies SurveyResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    // No re-publish involved — the toggle alone reopens collection
    await caller.saveResourceContent({
      content: { model, settings } satisfies SurveyResource,
      contentVersion: newResource.contentVersion + 1,
      id: newResource.id,
    });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    expect(newSurveyResponse.partitionKey).toBe(newResource.id);
  });

  test("deletes survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    await caller.createSurveyResponse({
      model: { satisfaction: 1 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    await caller.deleteSurveyResponse({ id: newResource.id, rowKey: newSurveyResponse.rowKey });
    const responseCount = await caller.countSurveyResponses({ id: newResource.id });

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
    await expect(
      caller.readSurveyResponse({ partitionKey: newResource.id, rowKey: newSurveyResponse.rowKey }),
    ).resolves.toBeNull();
  });

  test("fails delete survey response with non-existent row key", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    await caller.deleteSurveyResponse({ id: newResource.id, rowKey: newSurveyResponse.rowKey });

    await expect(
      caller.deleteSurveyResponse({ id: newResource.id, rowKey: newSurveyResponse.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(AzureEntityType.SurveyResponse, JSON.stringify({ partitionKey: newResource.id, rowKey: newSurveyResponse.rowKey })).message}]`,
    );
  });

  test("fails delete survey response with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.deleteSurveyResponse({ id: newResource.id, rowKey: newSurveyResponse.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails delete survey response across surveys", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const otherResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    // The partition key is derived from the owner-checked id, so another survey's id cannot reach this row
    await expect(
      caller.deleteSurveyResponse({ id: otherResource.id, rowKey: newSurveyResponse.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(AzureEntityType.SurveyResponse, JSON.stringify({ partitionKey: otherResource.id, rowKey: newSurveyResponse.rowKey })).message}]`,
    );
  });

  test("counts survey responses", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const emptyCount = await caller.countSurveyResponses({ id: newResource.id });

    expect(emptyCount).toStrictEqual({ count: 0, isCapped: false });

    await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    const responseCount = await caller.countSurveyResponses({ id: newResource.id });

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
  });
});
