import { computeImpostorFade } from "#src/vegetation/computeImpostorFade";
import { IMPOSTOR_SWITCH_HEIGHTS } from "#src/vegetation/constants";
import { describe, expect, test } from "vitest";

const IMPOSTOR_HEIGHT = 2;
const SWITCH_DISTANCE = IMPOSTOR_HEIGHT * IMPOSTOR_SWITCH_HEIGHTS;

describe(computeImpostorFade, () => {
  test("a far tree shows its impostor", () => {
    expect.hasAssertions();

    expect(computeImpostorFade(SWITCH_DISTANCE * 2, IMPOSTOR_HEIGHT)).toBe(1);
  });

  test("a near tree keeps its mesh", () => {
    expect.hasAssertions();

    expect(computeImpostorFade(SWITCH_DISTANCE / 2, IMPOSTOR_HEIGHT)).toBe(0);
  });
});
