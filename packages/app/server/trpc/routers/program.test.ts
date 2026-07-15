import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";
import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Clause } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { danglingProgramBindingReason } from "@@/server/services/program/constants";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { AUDIENCE_KEY_COLUMN, createAudienceSheet } from "@@/server/trpc/routers/createAudienceSheet.test";
import { createBoundProgram } from "@@/server/trpc/routers/createBoundProgram.test";
import { datasetRouter } from "@@/server/trpc/routers/dataset";
import { programRouter } from "@@/server/trpc/routers/program";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureEntityType,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ProgramParticipantEntity,
  resources,
  ResourceType,
  SurveyResponseMode,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";
import { z } from "zod";

// This suite reads the participant table directly to prove the delete cleanup, so it needs the mock
// Registered in its own module graph — createMockContext's registration does not reach a direct import
vi.mock(
  import("@@/server/composables/azure/table/useTableClient"),
  () => import("@@/server/composables/azure/table/useTableClient.test"),
);

// The generic resource-procedure matrix is covered once in createResourceProcedures.test.ts;
// Here only the router wiring plus the program-specific participant issuance and status join.
describe("program", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["program"]>;
  let datasetCaller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";
  const model = "model";
  const settings = surveySettingsSchema.parse({});
  const identifiedSettings = { ...settings, responseMode: SurveyResponseMode.Identified };
  // Three participants is the smallest set exhibiting responded / not-responded / duplicate-key
  const keyValues = ["", " ", "a"];
  const keyValue = "keyValue";
  const danglingProgramBindingErrorMessage = new InvalidOperationError(
    Operation.Create,
    AzureEntityType.ProgramParticipant,
    danglingProgramBindingReason,
  ).message;
  const setupIdentifiedSurvey = async () => {
    const survey = await surveyCaller.createResource({ name });
    await surveyCaller.saveResourceContent({
      content: { model, settings: identifiedSettings } satisfies SurveyResource,
      contentVersion: survey.contentVersion,
      id: survey.id,
    });
    return survey;
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(programRouter)(mockContext);
    datasetCaller = createCallerFactory(datasetRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Program);

    const sheet = await createAudienceSheet(sheetCaller, name, keyValues);
    const survey = await surveyCaller.createResource({ name });
    const programResource: ProgramResource = {
      audience: { id: sheet.id, type: DatasetProviderType.Sheet },
      emailId: "",
      keyColumn: AUDIENCE_KEY_COLUMN,
      surveyId: survey.id,
    };
    await caller.saveResourceContent({
      content: programResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(programResource);
  });

  test("generates one token per distinct audience key value", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    // The empty key value is skipped and the duplicate collapses — one token per distinct participant
    const program = await createBoundProgram({
      keyValues: [...keyValues, "a"],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const participants = await caller.generateProgramParticipants({ id: program.id });

    expect(participants.map(({ keyValue }) => keyValue)).toStrictEqual([" ", "a"]);

    // Tokens are UUIDs, never derived from the key — a derivable token could be minted by anyone
    for (const { keyValue, token } of participants) {
      expect(token).not.toBe(keyValue);
      expect(z.uuid().safeParse(token).success).toBe(true);
    }
  });

  test("generateProgramParticipants is idempotent", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const participants = await caller.generateProgramParticipants({ id: program.id });
    const reissuedParticipants = await caller.generateProgramParticipants({ id: program.id });

    // Re-running never rotates a token — a rotated token would dead-link a link already sent out
    expect(reissuedParticipants).toStrictEqual(participants);
  });

  test("generateProgramParticipants issues one token per participant across concurrent runs", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    // Neither run sees the other's rows, so both try to issue every token — the storage key is what makes
    // One of them lose, and the loser adopts the winner's token instead of minting a rival
    const [participants, concurrentParticipants] = await Promise.all([
      caller.generateProgramParticipants({ id: program.id }),
      caller.generateProgramParticipants({ id: program.id }),
    ]);

    expect(concurrentParticipants).toStrictEqual(participants);

    const clauses: Clause<ProgramParticipantEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: program.id },
    ];
    const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
    const storedParticipants = await getTopNEntities(
      programParticipantClient,
      AZURE_MAX_PAGE_SIZE,
      ProgramParticipantEntity,
      {
        filter: serializeClauses(clauses),
      },
    );

    expect(storedParticipants).toHaveLength(participants.length);
  });

  test("generates only the missing tokens for a grown audience", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const participants = await caller.generateProgramParticipants({ id: program.id });
    const content = await caller.readResourceContent({ id: program.id });
    assert.exists(content?.audience);
    const grownSheet = await createAudienceSheet(sheetCaller, name, [" ", "a"]);
    await caller.saveResourceContent({
      content: { ...content, audience: { id: grownSheet.id, type: DatasetProviderType.Sheet } },
      contentVersion: program.contentVersion + 1,
      id: program.id,
    });
    const grownParticipants = await caller.generateProgramParticipants({ id: program.id });

    expect(grownParticipants).toHaveLength(2);
    expect(grownParticipants[0]).toStrictEqual(participants[0]);
  });

  test("fails generate with dangling audience binding", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const content = await caller.readResourceContent({ id: program.id });
    assert.exists(content?.audience);
    await sheetCaller.deleteResource({ id: content.audience.id });

    // The provider's UNAUTHORIZED never throws through — it surfaces as the program's own binding error
    await expect(caller.generateProgramParticipants({ id: program.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${danglingProgramBindingErrorMessage}]`,
    );
  });

  test("fails generate with wrong user", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await mockSessionOnce(mockContext.db);

    await expect(caller.generateProgramParticipants({ id: program.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails read status with wrong user", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await mockSessionOnce(mockContext.db);

    await expect(caller.readProgramStatus({ id: program.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads status joining participants against responses", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const participants = await caller.generateProgramParticipants({ id: program.id });
    const [respondedParticipant, unrespondedParticipant] = participants;
    assert.exists(respondedParticipant);
    assert.exists(unrespondedParticipant);
    await surveyCaller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: respondedParticipant.token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const statusRows = await caller.readProgramStatus({ id: program.id });

    expect(statusRows.map(({ isResponded, keyValue }) => ({ isResponded, keyValue }))).toStrictEqual([
      { isResponded: true, keyValue: respondedParticipant.keyValue },
      { isResponded: false, keyValue: unrespondedParticipant.keyValue },
    ]);
  });

  test("reads status with an anonymous-era responder", async () => {
    expect.hasAssertions();

    const survey = await surveyCaller.createResource({ name });
    await surveyCaller.saveResourceContent({
      content: { model, settings } satisfies SurveyResource,
      contentVersion: survey.contentVersion,
      id: survey.id,
    });
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await caller.generateProgramParticipants({ id: program.id });
    // A response carrying no token carries nobody, so it is simply not a participant row
    await surveyCaller.createSurveyResponse({
      model: { satisfaction: 0 },
      participantToken: "",
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const statusRows = await caller.readProgramStatus({ id: program.id });

    expect(statusRows.map(({ isResponded }) => isResponded)).toStrictEqual([false]);
  });

  test("reads status with a deleted survey binding", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await caller.generateProgramParticipants({ id: program.id });
    await surveyCaller.deleteResource({ id: survey.id });
    const statusRows = await caller.readProgramStatus({ id: program.id });

    // Participants persist and stay readable with responses gone — the fail-soft posture for dangling links
    expect(statusRows.map(({ isResponded }) => isResponded)).toStrictEqual([false]);
  });

  test("serves the status dataset without the audience key value or the participant token", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    // A distinctive key value so the "never leaks the participant list" assertion has a real needle
    const program = await createBoundProgram({
      keyValues: [keyValue],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const participants = await caller.generateProgramParticipants({ id: program.id });
    const participant = participants[0];
    assert.exists(participant);
    const dataset = await datasetCaller.readDataset({ id: program.id, type: DatasetProviderType.ProgramStatus });

    expect(dataset.columns.map(({ name }) => name)).toStrictEqual(["participant", "addedAt", "responded"]);
    expect(dataset.rows.map(({ responded }) => responded)).toStrictEqual([false]);
    // A dashboard bound to this dataset is publishable, so neither the participant list nor the token
    // May enter it — the token is the credential survey writes accept, so publishing it would let any
    // Viewer respond as that participant
    expect(JSON.stringify(dataset)).not.toContain(participant.keyValue);
    expect(JSON.stringify(dataset)).not.toContain(participant.token);
  });

  test("fails read status dataset with wrong user", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await mockSessionOnce(mockContext.db);

    await expect(
      datasetCaller.readDataset({ id: program.id, type: DatasetProviderType.ProgramStatus }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes program participants with the program", async () => {
    expect.hasAssertions();

    const survey = await setupIdentifiedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await caller.generateProgramParticipants({ id: program.id });
    await caller.deleteResource({ id: program.id });
    // The program row is gone, so the partition can only be observed against the table itself
    const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
    const clauses: Clause<ProgramParticipantEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: program.id },
    ];
    const remainingParticipants = await getTopNEntities(
      programParticipantClient,
      AZURE_MAX_PAGE_SIZE,
      ProgramParticipantEntity,
      {
        filter: serializeClauses(clauses),
      },
    );

    expect(remainingParticipants).toStrictEqual([]);
  });
});
