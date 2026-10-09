import { computeMiningOutcropRespawn } from "#src/services/leyLine/computeMiningOutcropRespawn";
import { describe, expect, test } from "vitest";

describe(computeMiningOutcropRespawn, () => {
  // Six o'clock in the game's time zone, UTC+8, is the refresh time of the day the epoch begins
  const refresh = Temporal.Instant.from("1970-01-01T06:00:00+08:00");

  test("a mining outcrop mined before the day's draw is back at that draw", () => {
    expect.hasAssertions();
    expect(computeMiningOutcropRespawn(refresh.subtract({ hours: 1 }))).toStrictEqual(refresh);
  });

  test("a mining outcrop mined at or after the day's draw is back at the next day's", () => {
    expect.hasAssertions();
    expect(computeMiningOutcropRespawn(refresh)).toStrictEqual(refresh.add({ hours: 24 }));
    expect(computeMiningOutcropRespawn(refresh.add({ hours: 1 }))).toStrictEqual(refresh.add({ hours: 24 }));
  });
});
