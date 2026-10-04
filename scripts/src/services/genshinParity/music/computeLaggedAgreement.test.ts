import { computeLaggedAgreement } from "#src/services/genshinParity/music/computeLaggedAgreement";
import { describe, expect, test } from "vitest";

const createClasses = (pitchClassFrames: [number, number][]) => {
  const classes = new Float32Array(3 * 12);
  for (const [frame, pitchClass] of pitchClassFrames) classes[frame * 12 + pitchClass] = 1;
  return classes;
};

describe(computeLaggedAgreement, () => {
  test("finds the lag a late signal agrees best at", () => {
    expect.hasAssertions();

    const late = createClasses([
      [1, 0],
      [2, 1],
    ]);
    const onTime = createClasses([
      [0, 0],
      [1, 1],
    ]);

    expect(computeLaggedAgreement(late, onTime, [0, 1], 1)).toStrictEqual({ agreement: 0, lag: 1, lagAgreement: 1 });
  });
});
