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
});
