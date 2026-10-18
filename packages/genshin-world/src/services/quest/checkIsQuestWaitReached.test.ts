import { checkIsQuestWaitReached } from "#src/services/quest/checkIsQuestWaitReached";
import { MINUTES_PER_HOUR } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(checkIsQuestWaitReached, () => {
  test("wait window reached", () => {
    expect.hasAssertions();

    const questWait = { days: 0, fromHour: 9, toHour: 11 };

    expect([
      checkIsQuestWaitReached(questWait, 0, 9 * MINUTES_PER_HOUR - 1),
      checkIsQuestWaitReached(questWait, 0, 9 * MINUTES_PER_HOUR),
      checkIsQuestWaitReached(questWait, 0, 11 * MINUTES_PER_HOUR - 1),
      checkIsQuestWaitReached(questWait, 0, 11 * MINUTES_PER_HOUR),
    ]).toStrictEqual([false, true, true, false]);
  });

  test("wait window wrapping midnight", () => {
    expect.hasAssertions();

    const questWait = { days: 0, fromHour: 22, toHour: 2 };

    expect([
      checkIsQuestWaitReached(questWait, 0, 12 * MINUTES_PER_HOUR),
      checkIsQuestWaitReached(questWait, 0, 23 * MINUTES_PER_HOUR),
      checkIsQuestWaitReached(questWait, 0, MINUTES_PER_HOUR),
      checkIsQuestWaitReached(questWait, 0, 2 * MINUTES_PER_HOUR),
    ]).toStrictEqual([false, true, true, false]);
  });

  test("a window of the whole day is always reached", () => {
    expect.hasAssertions();

    const questWait = { days: 0, fromHour: 0, toHour: 24 };

    expect([
      checkIsQuestWaitReached(questWait, 0, 0),
      checkIsQuestWaitReached(questWait, 0, 24 * MINUTES_PER_HOUR - 1),
    ]).toStrictEqual([true, true]);
  });

  test("a window is not reached before its days have passed", () => {
    expect.hasAssertions();

    const questWait = { days: 2, fromHour: 0, toHour: 24 };

    expect([checkIsQuestWaitReached(questWait, 1, 0), checkIsQuestWaitReached(questWait, 2, 0)]).toStrictEqual([
      false,
      true,
    ]);
  });
});
