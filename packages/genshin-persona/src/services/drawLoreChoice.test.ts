import { drawLoreChoice } from "#src/services/drawLoreChoice";
import { describe, expect, test } from "vitest";

describe(drawLoreChoice, () => {
  const probabilities = { a: 0.5, b: 0.5 };

  test("draws by the tier's odds", () => {
    expect.hasAssertions();

    expect(drawLoreChoice(probabilities, 0)).toBe("a");
    expect(drawLoreChoice(probabilities, 0.5)).toBe("b");
  });

  test("draws nothing from no odds", () => {
    expect.hasAssertions();

    expect(drawLoreChoice({}, 0)).toBeUndefined();
  });
});
