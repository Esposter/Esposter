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
  ProgramInviteEntity,
  resources,
  ResourceType,
  SurveyResponseMode,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";
import { z } from "zod";

// This suite reads the invite table directly to prove the delete cleanup, so it needs the mock
// Registered in its own module graph — createMockContext's registration does not reach a direct import
vi.mock(
  import("@@/server/composables/azure/table/useTableClient"),
  () => import("@@/server/composables/azure/table/useTableClient.test"),
);

// The generic resource-procedure matrix is covered once in createResourceProcedures.test.ts;
// Here only the router wiring plus the program-specific invite issuance and status join.
describe("program", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["program"]>;
  let datasetCaller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";
  const model = "model";
  const settings = surveySettingsSchema.parse({});
  const invitedSettings = { ...settings, responseMode: SurveyResponseMode.Invited };
  // Three recipients is the smallest set exhibiting responded / not-responded / duplicate-key
  const keyValues = ["", " ", "a"];
  const keyValue = "keyValue";
  const danglingProgramBindingErrorMessage = new InvalidOperationError(
    Operation.Create,
    AzureEntityType.ProgramInvite,
    danglingProgramBindingReason,
  ).message;
  const setupInvitedSurvey = async () => {
    const survey = await surveyCaller.createResource({ name });
    await surveyCaller.saveResourceContent({
      content: { model, settings: invitedSettings } satisfies SurveyResource,
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

    const survey = await setupInvitedSurvey();
    // The empty key value is skipped and the duplicate collapses — one token per distinct recipient
    const program = await createBoundProgram({
      keyValues: [...keyValues, "a"],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const invites = await caller.generateProgramInvites({ id: program.id });

    expect(invites.map(({ keyValue }) => keyValue)).toStrictEqual([" ", "a"]);
    // Tokens are UUIDs, never derived from the key — a derivable token could be minted by anyone
    for (const { keyValue, token } of invites) {
      expect(token).not.toBe(keyValue);
      expect(z.uuid().safeParse(token).success).toBe(true);
    }
  });

  test("generateProgramInvites is idempotent", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const invites = await caller.generateProgramInvites({ id: program.id });
    const reissuedInvites = await caller.generateProgramInvites({ id: program.id });

    // Re-running never rotates a token — a rotated token would dead-link an already-sent invite
    expect(reissuedInvites).toStrictEqual(invites);
  });

  test("generates only the missing tokens for a grown audience", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const invites = await caller.generateProgramInvites({ id: program.id });
    const content = await caller.readResourceContent({ id: program.id });
    assert.exists(content?.audience);
    const grownSheet = await createAudienceSheet(sheetCaller, name, [" ", "a"]);
    await caller.saveResourceContent({
      content: { ...content, audience: { id: grownSheet.id, type: DatasetProviderType.Sheet } },
      contentVersion: program.contentVersion + 1,
      id: program.id,
    });
    const grownInvites = await caller.generateProgramInvites({ id: program.id });

    expect(grownInvites).toHaveLength(2);
    expect(grownInvites[0]).toStrictEqual(invites[0]);
  });

  test("fails generate with dangling audience binding", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
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
    await expect(caller.generateProgramInvites({ id: program.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${danglingProgramBindingErrorMessage}]`,
    );
  });

  test("fails generate with wrong user", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await mockSessionOnce(mockContext.db);

    await expect(caller.generateProgramInvites({ id: program.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails read status with wrong user", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
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

  test("reads status joining invites against responses", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    const program = await createBoundProgram({
      keyValues,
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const invites = await caller.generateProgramInvites({ id: program.id });
    const [respondedInvite, invitedOnlyInvite] = invites;
    assert.exists(respondedInvite);
    assert.exists(invitedOnlyInvite);
    await surveyCaller.createSurveyResponse({
      inviteToken: respondedInvite.token,
      model: { satisfaction: 0 },
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const statusRows = await caller.readProgramStatus({ id: program.id });

    expect(statusRows.map(({ isResponded, keyValue }) => ({ isResponded, keyValue }))).toStrictEqual([
      { isResponded: true, keyValue: respondedInvite.keyValue },
      { isResponded: false, keyValue: invitedOnlyInvite.keyValue },
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
    await caller.generateProgramInvites({ id: program.id });
    // A response carrying no token was never invited, so it is simply not an invite row
    await surveyCaller.createSurveyResponse({
      inviteToken: "",
      model: { satisfaction: 0 },
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const statusRows = await caller.readProgramStatus({ id: program.id });

    expect(statusRows.map(({ isResponded }) => isResponded)).toStrictEqual([false]);
  });

  test("reads status with a deleted survey binding", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await caller.generateProgramInvites({ id: program.id });
    await surveyCaller.deleteResource({ id: survey.id });
    const statusRows = await caller.readProgramStatus({ id: program.id });

    // Invites persist and stay readable with responses gone — the fail-soft posture for dangling links
    expect(statusRows.map(({ isResponded }) => isResponded)).toStrictEqual([false]);
  });

  test("serves the status dataset without the audience key column", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    // A distinctive key value so the "never leaks the recipient list" assertion has a real needle
    const program = await createBoundProgram({
      keyValues: [keyValue],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    const invites = await caller.generateProgramInvites({ id: program.id });
    const invite = invites[0];
    assert.exists(invite);
    const dataset = await datasetCaller.readDataset({ id: program.id, type: DatasetProviderType.ProgramStatus });

    expect(dataset.columns.map(({ name }) => name)).toStrictEqual(["recipient", "invitedAt", "responded"]);
    // A dashboard bound to this dataset is publishable, so the recipient list must never enter it
    expect(dataset.rows.map(({ recipient, responded }) => ({ recipient, responded }))).toStrictEqual([
      { recipient: invite.token, responded: false },
    ]);
    expect(JSON.stringify(dataset)).not.toContain(invite.keyValue);
  });

  test("fails read status dataset with wrong user", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
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

  test("deletes program invites with the program", async () => {
    expect.hasAssertions();

    const survey = await setupInvitedSurvey();
    const program = await createBoundProgram({
      keyValues: [" "],
      name,
      programCaller: caller,
      sheetCaller,
      surveyId: survey.id,
    });
    await caller.generateProgramInvites({ id: program.id });
    await caller.deleteResource({ id: program.id });
    // The program row is gone, so the partition can only be observed against the table itself
    const programInviteClient = await useTableClient(AzureTable.ProgramInvites);
    const clauses: Clause<ProgramInviteEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: program.id },
    ];
    const remainingInvites = await getTopNEntities(programInviteClient, AZURE_MAX_PAGE_SIZE, ProgramInviteEntity, {
      filter: serializeClauses(clauses),
    });

    expect(remainingInvites).toStrictEqual([]);
  });
});
