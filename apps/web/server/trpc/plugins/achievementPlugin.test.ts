import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { achievements, ClickerAchievementName } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("achievementPlugin", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(trpcRouter)(mockContext);
  });

  // `unlockedAt` is stamped from `new Date()`, so a frozen clock makes it exactly assertable
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    await mockContext.db.delete(achievements);
  });

  test("mutation succeeds when achievement processing fails", async () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    // The plugin reaches the database only through insert upserts, and the mutation itself saves to blob storage
    vi.spyOn(mockContext.db, "insert").mockImplementation(() => {
      throw new Error("Database insert failed");
    });
    const clickerSave = new ClickerSave();
    await caller.clicker.saveClicker(clickerSave);
    const storedClickerSave = await caller.clicker.readClicker();
    const userAchievements = await caller.achievement.readUserAchievements();

    expect(storedClickerSave).toStrictEqual(clickerSave);
    expect(userAchievements).toStrictEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(
      achievementDefinitions.filter(({ condition, triggerPath }) => triggerPath === "clicker.saveClicker" && !condition)
        .length,
    );
  });

  test("processes achievements on the happy path", async () => {
    expect.hasAssertions();

    await caller.clicker.saveClicker(new ClickerSave());
    const userAchievements = await caller.achievement.readUserAchievements();
    const clickerNovice = userAchievements.find(
      ({ achievement }) => achievement.name === ClickerAchievementName.ClickerNovice,
    );

    assert.exists(clickerNovice);

    expect(clickerNovice.amount).toBe(1);
    expect(clickerNovice.unlockedAt).toStrictEqual(new Date(0));
  });

  test("counts every increment when mutations run concurrently", async () => {
    expect.hasAssertions();

    await Promise.all([caller.clicker.saveClicker(new ClickerSave()), caller.clicker.saveClicker(new ClickerSave())]);
    const userAchievements = await caller.achievement.readUserAchievements();
    // Novice unlocks on the first save, so a still-locked achievement is what proves neither increment was lost
    const clickerSaver = userAchievements.find(
      ({ achievement }) => achievement.name === ClickerAchievementName.ClickerSaver,
    );

    assert.exists(clickerSaver);

    expect(clickerSaver.amount).toBe(2);
    expect(clickerSaver.unlockedAt).toBeNull();
  });
});
