import { getSyllableCount } from "#src/services/voiceMatch/getSyllableCount";
import { describe, expect, test } from "vitest";

describe(getSyllableCount, () => {
  const LOUD_DB = 0;
  const QUIET_DB = -60;
  const voiced = (length: number) => new Array<number>(length).fill(1);

  test("counts a voiced energy peak once per dip between peaks", () => {
    expect.hasAssertions();

    const energiesDb = [QUIET_DB, LOUD_DB, -10, LOUD_DB, QUIET_DB];

    expect(getSyllableCount({ energiesDb, f0sHz: voiced(energiesDb.length) })).toBe(2);
  });

  test("reads two peaks with too shallow a dip between them as one syllable", () => {
    expect.hasAssertions();

    const energiesDb = [QUIET_DB, LOUD_DB, -1, LOUD_DB, QUIET_DB];

    expect(getSyllableCount({ energiesDb, f0sHz: voiced(energiesDb.length) })).toBe(1);
  });

  test("skips a peak with no pitch under it", () => {
    expect.hasAssertions();

    expect(getSyllableCount({ energiesDb: [QUIET_DB, LOUD_DB, QUIET_DB], f0sHz: [0, 0, 0] })).toBe(0);
  });
});
