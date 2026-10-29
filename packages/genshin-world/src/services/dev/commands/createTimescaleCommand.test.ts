import type { GameClock } from "genshin-engine";

import { createTimescaleCommand } from "#src/services/dev/commands/createTimescaleCommand";
import { describe, expect, test } from "vitest";

describe(createTimescaleCommand, () => {
  test("a zero holds the game clock still", () => {
    expect.hasAssertions();

    const gameClock: GameClock = { minutes: 0, minutesPerSecond: 1 };
    const result = createTimescaleCommand({ getGameClock: () => gameClock }).run({ minutesPerSecond: 0 });

    expect({ minutesPerSecond: gameClock.minutesPerSecond, result }).toStrictEqual({
      minutesPerSecond: 0,
      result: { ok: true, value: 0 },
    });
  });

  test("runs nothing while the world's clock is not mounted", () => {
    expect.hasAssertions();

    const result = createTimescaleCommand({ getGameClock: () => undefined }).run({ minutesPerSecond: 0 });

    expect(result).toStrictEqual({ error: "not available here", ok: false });
  });
});
