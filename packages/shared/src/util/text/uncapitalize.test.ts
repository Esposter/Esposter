import { uncapitalize } from "@/util/text/uncapitalize";
import { describe, expect, test } from "vitest";

describe(uncapitalize, () => {
  test("uncapitalizes", () => {
    expect.hasAssertions();

    expect(uncapitalize("")).toBe("");
    expect(uncapitalize("a")).toBe("a");
    expect(uncapitalize("A")).toBe("a");
    expect(uncapitalize("0")).toBe("0");
    expect(uncapitalize("aa")).toBe("aa");
    expect(uncapitalize("aA")).toBe("aA");
    expect(uncapitalize("a0")).toBe("a0");
    expect(uncapitalize("Aa")).toBe("aa");
    expect(uncapitalize("AA")).toBe("aA");
    expect(uncapitalize("A0")).toBe("a0");
    expect(uncapitalize("0a")).toBe("0a");
    expect(uncapitalize("0A")).toBe("0A");
    expect(uncapitalize("00")).toBe("00");
    expect(uncapitalize(" a")).toBe(" a");
    expect(uncapitalize(" A")).toBe(" A");
    expect(uncapitalize(" 0")).toBe(" 0");
  });
});
