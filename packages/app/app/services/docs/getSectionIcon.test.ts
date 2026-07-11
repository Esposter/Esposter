import { getSectionIcon } from "@/services/docs/getSectionIcon";
import { describe, expect, test } from "vitest";

describe(getSectionIcon, () => {
  test("returns the mapped icon for a known section", () => {
    expect.hasAssertions();

    expect(getSectionIcon("/docs/esbabbler")).toBe("mdi-forum");
  });

  test("falls back to the default icon for unknown sections", () => {
    expect.hasAssertions();

    expect(getSectionIcon("/docs/unknown")).toBe("mdi-book-open-variant");
  });
});
