import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { scoreLabelSimilarity } from "#src/services/genshinParity/witness/scoreLabelSimilarity";
import { describe, expect, test } from "vitest";

const createTargets = (
  families: (number | undefined)[],
  greys: number[],
): { colour: Float32Array; part: Float32Array } => ({
  colour: Float32Array.from(greys.flatMap((grey) => [grey, grey, grey, 1])),
  part: Float32Array.from(families.flatMap((family) => (family === undefined ? [0, 0, 0, 1] : [1, family, 0, 1]))),
});

describe(compareFamilyColour, () => {
  test("reads the mean colours' distance where both draw a family, and none where ours draws it nowhere", async () => {
    expect.hasAssertions();

    const exportsTargets = createTargets([0, 0, 1, 1], [1, 1, 1, 1]);
    const oursTargets = createTargets([0, 0, undefined, undefined], [0, 0, 0, 0]);

    const colours = (
      await compareFamilyColour(exportsTargets, oursTargets, 4, 2, async (input) => scoreLabelSimilarity(input))
    ).comparisons.map(({ colour, family }) => ({ colour, family }));

    expect(colours).toStrictEqual([
      { colour: 100, family: 0 },
      { colour: Infinity, family: 1 },
    ]);
  });
});
