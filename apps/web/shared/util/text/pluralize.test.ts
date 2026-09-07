import { pluralize } from "#shared/util/text/pluralize";
import { describe, expect, test } from "vitest";

describe(pluralize, () => {
  test("pluralizes", () => {
    expect.hasAssertions();

    expect(pluralize("cursor")).toBe("cursors");
    expect(pluralize("file", 0)).toBe("files");
    expect(pluralize("file", 1)).toBe("file");
    expect(pluralize("file", 2)).toBe("files");
  });

  // Suffixing an `s` is wrong for a whole class of words, and the count rule is the half worth sharing — a caller
  // With an irregular plural spells that half out rather than writing the rule again
  test("pluralizes an irregular plural", () => {
    expect.hasAssertions();

    expect(pluralize("reply", 0, "replies")).toBe("replies");
    expect(pluralize("reply", 1, "replies")).toBe("reply");
    expect(pluralize("reply", 2, "replies")).toBe("replies");
  });
});
