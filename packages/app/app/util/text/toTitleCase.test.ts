import { toTitleCase } from "@/util/text/toTitleCase";
import { describe, expect, test } from "vitest";

describe(toTitleCase, () => {
  test("to title case", () => {
    expect.hasAssertions();

    expect(toTitleCase("")).toBe("");
    expect(toTitleCase("a")).toBe("A");
    expect(toTitleCase("a a")).toBe("A A");
  });
});
