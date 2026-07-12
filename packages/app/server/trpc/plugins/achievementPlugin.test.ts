import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { achievements, ClickerAchievementName } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("achievementPlugin", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(trpcRouter)(mockContext);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    await mockContext.db.delete(achievements);
  });

  test("mutation succeeds when achievement processing fails", async () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    vi.spyOn(mockContext.db.query.achievements, "findFirst").mockRejectedValue(new Error(""));
    const clicker = new Clicker();
    await caller.clicker.saveClicker(clicker);
    const readClicker = await caller.clicker.readClicker();
    const userAchievements = await caller.achievement.readUserAchievements();

    expect(readClicker).toStrictEqual(clicker);
    expect(userAchievements).toStrictEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(
      achievementDefinitions.filter(({ condition, triggerPath }) => triggerPath === "clicker.saveClicker" && !condition)
        .length,
    );
  });

  test("processes achievements on the happy path", async () => {
    expect.hasAssertions();

    await caller.clicker.saveClicker(new Clicker());
    const userAchievements = await caller.achievement.readUserAchievements();
    const clickerNovice = userAchievements.find(
      ({ achievement }) => achievement.name === ClickerAchievementName.ClickerNovice,
    );

    assert(clickerNovice);

    expect(clickerNovice.amount).toBe(1);
    expect(clickerNovice.unlockedAt).toBeInstanceOf(Date);
  });
});
