import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { surveys } from "#shared/db/schema/surveys";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { NIL } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("survey", () => {
  let caller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let mockContext: Context;

  beforeAll(async () => {
    const createCaller = createCallerFactory(surveyRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(surveys);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const name = "name";
    const group = "group";
    const model = "model";
    const newSurvey = await caller.createSurvey({ group, model, name });

    expect(newSurvey.name).toBe(name);
    expect(newSurvey.group).toBe(group);
    expect(newSurvey.model).toBe(model);
  });

  test("count", async () => {
    expect.hasAssertions();

    const count = await caller.count();

    expect(count).toBe(0);

    const name = "name";
    const group = "group";
    const model = "model";
    await caller.createSurvey({ group, model, name });
    const newCount = await caller.count();

    expect(newCount).toBe(1);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const name = "name";
    const group = "group";
    const model = "model";
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

  test("updates", async () => {
    expect.hasAssertions();

    const name = "name";
    const group = "group";
    const model = "model";
    const newSurvey = await caller.createSurvey({ group, model, name });
    const updatedName = "updatedName";
    const updatedSurvey = await caller.updateSurvey({
      id: newSurvey.id,
      modelVersion: newSurvey.modelVersion,
      name: updatedName,
    });

    expect(updatedSurvey.name).toBe(updatedName);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updateSurvey({ id: NIL, modelVersion: 0 })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Survey is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails update with old model version", async () => {
    expect.hasAssertions();

    const name = "name";
    const group = "group";
    const model = "model";
    const newSurvey = await caller.createSurvey({ group, model, name });

    await expect(
      caller.updateSurvey({ id: newSurvey.id, modelVersion: newSurvey.modelVersion - 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Survey, cannot update survey model with old model version]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const name = "name";
    const group = "group";
    const model = "model";
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
});
