import { computeStructureError } from "#src/services/genshinParity/passes/computeStructureError";
import { computeStructureTerms } from "#src/services/genshinParity/passes/computeStructureTerms";
import { describe, expect, test } from "vitest";

describe(computeStructureTerms, () => {
  test("a family's structure loss is read term by term", () => {
    expect.hasAssertions();
    expect(computeStructureTerms([0.5, 0, 0.25], [0.25, 0.1, 0.5])).toStrictEqual([
      { error: -0.5, index: 0, reference: 0.5, shot: 0.25 },
      { error: 1, index: 2, reference: 0.25, shot: 0.5 },
    ]);
  });

  test("a family's structure is the root mean square of its terms", () => {
    expect.hasAssertions();
    const referenceStatistics = [0.4, 0.2, 0.1, 0.05, 0.01];
    const shotStatistics = [0.3, 0.25, 0.05, 0.05, 0];
    const errors = computeStructureTerms(referenceStatistics, shotStatistics).map(({ error }) => error);
    expect(Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length)).toBeCloseTo(
      computeStructureError(referenceStatistics, shotStatistics),
    );
  });
});
