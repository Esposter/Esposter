import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { surveys } from "#shared/db/schema/surveys";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockUserOnce } from "@@/server/trpc/context.test";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { NIL } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("survey", () => {
  let caller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let mockContext: Context;
  const name = "name";
  const updatedName = "updatedName";
  const group = "group";
  const model = "model";
  const updatedModel = "updatedModel";

  beforeAll(async () => {
    const createCaller = createCallerFactory(surveyRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(surveys);
  });

  test.todo("creates", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });

    expect(newSurvey.name).toBe(name);
    expect(newSurvey.group).toBe(group);
    expect(newSurvey.model).toBe(model);
  });

  test.todo("count", async () => {
    expect.hasAssertions();

    const count = await caller.count();

    expect(count).toBe(0);

    await caller.createSurvey({ group, model, name });
    const newCount = await caller.count();

    expect(newCount).toBe(1);
  });

  test.todo("reads", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    const readSurvey = await caller.readSurvey(newSurvey.id);

    expect(readSurvey).toStrictEqual(newSurvey);
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readSurvey(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Survey is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test.todo("updates", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    const updatedSurvey = await caller.updateSurvey({ id: newSurvey.id, name: updatedName });

    expect(updatedSurvey.name).toBe(updatedName);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updateSurvey({ id: NIL, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Survey, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test.todo("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    await mockUserOnce(mockContext.db);

    await expect(caller.updateSurvey({ id: newSurvey.id, name })).rejects.toThrowErrorMatchingInlineSnapshot();
  });

  test.todo("updates model", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    const updatedSurvey = await caller.updateSurveyModel({
      id: newSurvey.id,
      model: updatedModel,
      modelVersion: newSurvey.modelVersion,
    });

    expect(updatedSurvey.model).toBe(updatedModel);
  });

  test("fails update model with non-existent id", async () => {
    expect.hasAssertions();

    await expect(
      caller.updateSurveyModel({ id: NIL, model, modelVersion: 0 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Survey is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test.todo("fails update model with wrong user", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    await mockUserOnce(mockContext.db);

    await expect(
      caller.updateSurveyModel({ id: newSurvey.id, model, modelVersion: 0 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot();
  });

  test.todo("fails update model with old model version", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });

    await expect(
      caller.updateSurveyModel({ id: newSurvey.id, model, modelVersion: newSurvey.modelVersion - 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Survey, cannot update survey model with old model version]`,
    );
  });

  test.todo("fails update model with duplicate", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });

    await expect(
      caller.updateSurveyModel({ id: newSurvey.id, model, modelVersion: newSurvey.modelVersion }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Survey, duplicate model]`,
    );
  });

  test.todo("deletes", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    const deletedSurvey = await caller.deleteSurvey(newSurvey.id);

    expect(deletedSurvey.id).toBe(newSurvey.id);
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.deleteSurvey(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Survey, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test.todo("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newSurvey = await caller.createSurvey({ group, model, name });
    await mockUserOnce(mockContext.db);

    await expect(caller.deleteSurvey(newSurvey.id)).rejects.toThrowErrorMatchingInlineSnapshot();
  });
});
