import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";
import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import {
  CLOSED_SURVEY_ERROR_REASON,
  INVALID_PARTICIPANT_TOKEN_ERROR_REASON,
} from "@@/server/services/survey/constants";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { createBoundProgram } from "@@/server/trpc/routers/createBoundProgram.test";
import { programRouter } from "@@/server/trpc/routers/program";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import {
  AzureEntityType,
  AzureTable,
  DatabaseEntityType,
  resources,
  ResourceType,
  SurveyResponseMode,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

// The survey-specific procedures.
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
    INVALID_PARTICIPANT_TOKEN_ERROR_REASON,
  ).message;
  const closedSurveyErrorMessage = new InvalidOperationError(
    Operation.Create,
    AzureEntityType.SurveyResponse,
    CLOSED_SURVEY_ERROR_REASON,
  ).message;
  // Settings are live working state rather than snapshot state, so most tests reach the behaviour they are after
  // By writing content at a known version — the version is what the caller varies, never the envelope
  const saveSurveyContent = (id: string, contentVersion: number, content: SurveyResource) =>
    caller.saveResourceContent({ content, contentVersion, id });
  // A response is always the same envelope — one answer under a fresh row key — and the token is the only part
  // An Anonymous survey leaves empty, so it defaults to what the mode that does not use it sends
  const createSurveyResponse = (partitionKey: string, satisfaction: number, participantToken = "") =>
    caller.createSurveyResponse({
      model: { satisfaction },
      participantToken,
      partitionKey,
      rowKey: crypto.randomUUID(),
    });
  // An edit addresses the response it is editing, so the row identifies itself rather than being restated
  const updateSurveyResponse = (
    surveyResponse: Awaited<ReturnType<typeof createSurveyResponse>>,
    satisfaction: number,
    participantToken = "",
  ) =>
    caller.updateSurveyResponse({
      model: { satisfaction },
      modelVersion: surveyResponse.modelVersion,
      participantToken,
      partitionKey: surveyResponse.partitionKey,
      rowKey: surveyResponse.rowKey,
    });
  // An Identified survey plus a program bound to it, returning the survey and its one valid token
  const setupIdentifiedSurvey = async () => {
    const survey = await caller.createResource({ name });
    await saveSurveyContent(survey.id, survey.contentVersion, { model, settings: identifiedSettings });
    const program = await createBoundProgram({
      keyValues: [keyValue],
      name,
      programCaller,
      sheetCaller,
      surveyId: survey.id,
    });
    const [participant] = await programCaller.generateProgramParticipants({ id: program.id });
    assert.exists(participant);
    return { program, survey, token: participant.token };
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

    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual({ model, settings });
  });

  test("clears its response partition when the resource is purged", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings });
    await createSurveyResponse(newResource.id, 0);

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
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );
  });

  test("serves the published snapshot to respondents, not later edits", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings });
    await caller.publishResource({ id: newResource.id });
    await saveSurveyContent(newResource.id, newResource.contentVersion + 1, { model: updatedModel, settings });
    const { content } = await caller.readPublishedResourceContent(newResource.id);

    expect(content.model).toBe(model);
  });

  test("creates and reads survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 1);
    const surveyResponse = await caller.readSurveyResponse({
      partitionKey: newSurveyResponse.partitionKey,
      rowKey: newSurveyResponse.rowKey,
    });

    expect(surveyResponse).toStrictEqual(newSurveyResponse);
  });

  test("reads undefined survey response with non-existent id", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const surveyResponse = await caller.readSurveyResponse({
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    expect(surveyResponse).toBeUndefined();
  });

  test("updates survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);
    const updatedSurveyResponse = await updateSurveyResponse(newSurveyResponse, 1);

    expect(updatedSurveyResponse.model).toStrictEqual({ satisfaction: 1 });
    expect(updatedSurveyResponse.modelVersion).toBe(newSurveyResponse.modelVersion + 1);
  });

  test("fails update survey response with duplicate model", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);

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

  test("persists a page-only advance for the same answers", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      pageNo: 0,
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });
    // Same answers, later page — a real progress write, so it is not a duplicate and the resume position advances
    const updatedSurveyResponse = await caller.updateSurveyResponse({
      model: { satisfaction: 0 },
      modelVersion: newSurveyResponse.modelVersion,
      pageNo: 1,
      participantToken: "",
      partitionKey: newSurveyResponse.partitionKey,
      rowKey: newSurveyResponse.rowKey,
    });

    expect(updatedSurveyResponse.pageNo).toBe(1);
  });

  test("rejects a same-answer resubmit that does not advance the page", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await caller.createSurveyResponse({
      model: { satisfaction: 0 },
      pageNo: 2,
      participantToken: "",
      partitionKey: newResource.id,
      rowKey: crypto.randomUUID(),
    });

    // Navigating back and re-saving unchanged answers must not regress the stored resume page
    await expect(
      caller.updateSurveyResponse({
        model: { satisfaction: 0 },
        modelVersion: newSurveyResponse.modelVersion,
        pageNo: 1,
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
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);
    await updateSurveyResponse(newSurveyResponse, 1);

    await expect(updateSurveyResponse(newSurveyResponse, 2)).rejects.toThrowErrorMatchingInlineSnapshot(
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
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0, crypto.randomUUID());

    expect(newSurveyResponse.participantToken).toBe("");
  });

  test(`${SurveyResponseMode.Identified}: accepts a valid token and stores it`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await createSurveyResponse(survey.id, 0, token);

    expect(newSurveyResponse.participantToken).toBe(token);
  });

  test(`fails create with missing token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const { survey } = await setupIdentifiedSurvey();

    await expect(createSurveyResponse(survey.id, 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${invalidParticipantTokenErrorMessage}]`,
    );
  });

  // The binding is a column now, so unbinding has to clear it — the whole hazard of caching an authorization
  // Input is that a stale copy keeps answering yes after the owner has said no
  test(`${SurveyResponseMode.Identified}: rejects a token once the program is unbound from the survey`, async () => {
    expect.hasAssertions();

    const { program, survey, token } = await setupIdentifiedSurvey();
    // The save inside `createBoundProgram` already bumped the version, so the row is the version of record
    const unboundProgram = await mockContext.db.query.resources.findFirst({ where: { id: { eq: program.id } } });
    assert.exists(unboundProgram);
    await programCaller.saveResourceContent({
      content: { audience: null, emailId: "", keyColumn: "", surveyId: "" } satisfies ProgramResource,
      contentVersion: unboundProgram.contentVersion,
      id: program.id,
    });

    await expect(createSurveyResponse(survey.id, 0, token)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${invalidParticipantTokenErrorMessage}]`,
    );
  });

  test(`fails create with forged token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const { survey } = await setupIdentifiedSurvey();

    await expect(createSurveyResponse(survey.id, 0, crypto.randomUUID())).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${invalidParticipantTokenErrorMessage}]`,
    );
  });

  test(`fails create with another survey's token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const { survey } = await setupIdentifiedSurvey();
    // A token issued by a program bound to a different survey is as good as a forgery
    const { token: otherToken } = await setupIdentifiedSurvey();

    await expect(createSurveyResponse(survey.id, 0, otherToken)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${invalidParticipantTokenErrorMessage}]`,
    );
  });

  test(`${SurveyResponseMode.Identified}: a recycle-binned program still resolves its token`, async () => {
    expect.hasAssertions();

    const { program, survey, token } = await setupIdentifiedSurvey();
    // Soft-deleting the program must not invalidate token links already distributed to participants
    await programCaller.deleteResource({ id: program.id });
    const newSurveyResponse = await createSurveyResponse(survey.id, 0, token);

    expect(newSurveyResponse.participantToken).toBe(token);
  });

  test(`${SurveyResponseMode.Identified}: resumes with the same token`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await createSurveyResponse(survey.id, 0, token);
    const updatedSurveyResponse = await updateSurveyResponse(newSurveyResponse, 1, token);

    expect(updatedSurveyResponse.participantToken).toBe(token);
  });

  test(`fails update with swapped token in ${SurveyResponseMode.Identified} mode`, async () => {
    expect.hasAssertions();

    const survey = await caller.createResource({ name });
    await saveSurveyContent(survey.id, survey.contentVersion, { model, settings: identifiedSettings });
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
    const newSurveyResponse = await createSurveyResponse(survey.id, 0, firstParticipant.token);

    await expect(
      updateSurveyResponse(newSurveyResponse, 1, secondParticipant.token),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${invalidParticipantTokenErrorMessage}]`);
  });

  test(`switching ${SurveyResponseMode.Identified} to ${SurveyResponseMode.Anonymous} applies on the next write`, async () => {
    expect.hasAssertions();

    const { survey, token } = await setupIdentifiedSurvey();
    const newSurveyResponse = await createSurveyResponse(survey.id, 0, token);
    // Settings are live working state, so no re-publish is involved in the switch
    await saveSurveyContent(survey.id, survey.contentVersion + 1, { model, settings });
    const anonymousSurveyResponse = await createSurveyResponse(survey.id, 1);
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
    const newSurveyResponse = await createSurveyResponse(survey.id, 0, token);
    await saveSurveyContent(survey.id, survey.contentVersion + 1, { model, settings });
    const updatedSurveyResponse = await updateSurveyResponse(newSurveyResponse, 1);

    // The funnel joins participants × responses by token, so an Anonymous-mode edit must not erase who answered
    expect(updatedSurveyResponse.participantToken).toBe(token);
  });

  test("fails create with closed survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings: closedSettings });

    await expect(createSurveyResponse(newResource.id, 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${closedSurveyErrorMessage}]`,
    );
  });

  test("fails create for a recycle-binned survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.deleteResource({ id: newResource.id });

    await expect(createSurveyResponse(newResource.id, 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
  });

  test("fails update with closed survey", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);
    // An in-flight respondent — form open when the survey closed — gets the rejection on submit
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings: closedSettings });

    await expect(updateSurveyResponse(newSurveyResponse, 1)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${closedSurveyErrorMessage}]`,
    );
  });

  test("serves the live closed flag over the published snapshot", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings });
    await caller.publishResource({ id: newResource.id });
    await saveSurveyContent(newResource.id, newResource.contentVersion + 1, {
      model: updatedModel,
      settings: closedSettings,
    });
    const { content } = await caller.readPublishedResourceContent(newResource.id);

    // The model stays the immutable snapshot while the settings are the live ones
    expect(content.model).toBe(model);
    expect(content.settings).toStrictEqual(closedSettings);
  });

  // A restore reconstitutes a snapshot rather than copying it, so it re-applies what the type declares live.
  // Copying the blob wholesale put the settings frozen at publish time back over the working copy — silently
  // Reopening a survey its owner had closed, and able to flip the response mode the write boundary makes its
  // Authorization decisions on, with nothing in the restore or its confirmation saying so
  test("keeps the live settings when a published version is restored over them", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings });
    await caller.publishResource({ id: newResource.id });
    await saveSurveyContent(newResource.id, newResource.contentVersion + 1, {
      model: updatedModel,
      settings: closedSettings,
    });
    await resourceCaller.restoreSnapshotVersion({ channel: SnapshotChannel.Published, id: newResource.id, version: 1 });
    const content = await caller.readResourceContent({ id: newResource.id });

    // The model is the snapshot's, which is the whole point of restoring — the settings are still the owner's
    expect(content?.model).toBe(model);
    expect(content?.settings).toStrictEqual(closedSettings);
  });

  test("serves the live settings on the owner's version preview", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings });
    await caller.publishResource({ id: newResource.id });
    await saveSurveyContent(newResource.id, newResource.contentVersion + 1, {
      model: updatedModel,
      settings: closedSettings,
    });
    const { content } = await caller.readPublishedVersionContent({ id: newResource.id, version: 1 });

    expect(content.model).toBe(model);
    expect(content.settings).toStrictEqual(closedSettings);
  });

  test("reopening accepts responses again", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await saveSurveyContent(newResource.id, newResource.contentVersion, { model, settings: closedSettings });
    // No re-publish involved — the toggle alone reopens collection
    await saveSurveyContent(newResource.id, newResource.contentVersion + 1, { model, settings });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);

    expect(newSurveyResponse.partitionKey).toBe(newResource.id);
  });

  test("deletes survey response", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);
    await createSurveyResponse(newResource.id, 1);
    await caller.deleteSurveyResponse({ id: newResource.id, rowKey: newSurveyResponse.rowKey });
    const responseCount = await caller.readSurveyResponsesCount({ id: newResource.id });

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
    await expect(
      caller.readSurveyResponse({ partitionKey: newResource.id, rowKey: newSurveyResponse.rowKey }),
    ).resolves.toBeUndefined();
  });

  test("fails delete survey response with non-existent row key", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);
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
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.deleteSurveyResponse({ id: newResource.id, rowKey: newSurveyResponse.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails delete survey response across surveys", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const otherResource = await caller.createResource({ name });
    const newSurveyResponse = await createSurveyResponse(newResource.id, 0);

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
    const emptyCount = await caller.readSurveyResponsesCount({ id: newResource.id });

    expect(emptyCount).toStrictEqual({ count: 0, isCapped: false });

    await createSurveyResponse(newResource.id, 0);
    const responseCount = await caller.readSurveyResponsesCount({ id: newResource.id });

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
  });
});
