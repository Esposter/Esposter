import { formatStructureTerms } from "#src/services/genshinParity/passes/formatStructureTerms";
import { describe, expect, test } from "vitest";

describe(formatStructureTerms, () => {
  test("a band's energy that reads as zero at four places keeps three significant figures", () => {
    expect.hasAssertions();
    expect(
      formatStructureTerms([
        { error: 0.5, index: 1, reference: 0.00012345, shot: 0.0000456 },
        { error: -0.25, index: 2, reference: 0.5, shot: 0.375 },
      ]),
    ).toBe("0.000123 | 0.0000456 | 0.500, 0.500 | 0.375 | -0.250");
  });
});
