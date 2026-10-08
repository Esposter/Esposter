import { computeLightningFlash } from "#src/atmosphere/computeLightningFlash";
import { LIGHTNING_FLASH_END } from "#src/atmosphere/constants";
import { describe, expect, test } from "vitest";

describe(computeLightningFlash, () => {
  test("is at its brightest at the strike and over within a second", () => {
    expect.hasAssertions();

    expect({
      atStrike: computeLightningFlash(0),
      isOver: computeLightningFlash(1) < LIGHTNING_FLASH_END,
    }).toStrictEqual({ atStrike: 1, isOver: true });
  });
});
