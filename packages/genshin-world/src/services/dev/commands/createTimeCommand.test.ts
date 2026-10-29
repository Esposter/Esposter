import type { GameClock } from "genshin-engine";

import { createTimeCommand } from "#src/services/dev/commands/createTimeCommand";
import { describe, expect, test } from "vitest";

describe(createTimeCommand, () => {
  test("sets the game clock to the hour and minute the line gives", () => {
    expect.hasAssertions();

    const gameClock: GameClock = { minutes: 0, minutesPerSecond: 0 };
    const result = createTimeCommand({ getGameClock: () => gameClock }).run({ time: "21:00" });

    expect({ minutes: gameClock.minutes, result }).toStrictEqual({
      minutes: 1260,
      result: { ok: true, value: "21:00" },
    });
  });

  test("runs nothing while the world's clock is not mounted", () => {
    expect.hasAssertions();

    const result = createTimeCommand({ getGameClock: () => undefined }).run({ time: "21:00" });

    expect(result).toStrictEqual({ error: "not available here", ok: false });
  });
});
