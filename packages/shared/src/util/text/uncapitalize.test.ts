import { uncapitalize } from "@/util/text/uncapitalize";
import { describe, expect, test } from "vitest";

describe(uncapitalize, () => {
  test("uncapitalizes", () => {
    expect.hasAssertions();

    expect(uncapitalize("")).toBe("");
    expect(uncapitalize("a")).toBe("a");
    expect(uncapitalize("A")).toBe("a");
    expect(uncapitalize("Aa")).toBe("aa");
  });
});
