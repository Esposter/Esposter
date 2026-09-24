import { pluralize } from "#shared/util/text/pluralize";
import { describe, expect, test } from "vitest";

describe(pluralize, () => {
  test("pluralizes", () => {
    expect.hasAssertions();

    expect(pluralize("a")).toBe("as");
    expect(pluralize("a", 0)).toBe("as");
    expect(pluralize("a", 1)).toBe("a");
    expect(pluralize("a", 2)).toBe("as");
  });

  // Suffixing an `s` is wrong for a whole class of words, and the count rule is the half worth sharing — a caller
  // With an irregular plural spells that half out rather than writing the rule again
  test("pluralizes an irregular plural", () => {
    expect.hasAssertions();

    expect(pluralize("a", 0, "b")).toBe("b");
    expect(pluralize("a", 1, "b")).toBe("a");
    expect(pluralize("a", 2, "b")).toBe("b");
  });
});
