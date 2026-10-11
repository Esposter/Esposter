import { getToneSplits } from "#src/services/genshinAssets/skillGlyphs/getToneSplits";
import { describe, expect, test } from "vitest";

describe(getToneSplits, () => {
  // A ramp of a few pixels in every twentieth from the pale tone's range up to the white, as an icon's antialiased edges
  // And gradients spread them
  const ramp = Array.from({ length: 12 }, (_value, index) =>
    Array.from({ length: 30 }, () => 0.275 + index * 0.05),
  ).flat();

  test("splits an icon with a pale tone under its white halfway to the pale and halfway between the two", () => {
    expect.hasAssertions();

    const shares = [...ramp, ...Array.from({ length: 200 }, () => 0.425), ...Array.from({ length: 300 }, () => 0.875)];

    expect(getToneSplits(shares)).toStrictEqual([0.2125, 0.65]);
  });

  test("splits an icon of one tone halfway to its white", () => {
    expect.hasAssertions();

    const shares = [...ramp, ...Array.from({ length: 300 }, () => 0.825)];

    expect(getToneSplits(shares)).toStrictEqual([0.4125]);
  });
});
