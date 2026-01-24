import { capitalize } from "@/util/text/capitalize";
import { describe, expect, test } from "vitest";

describe(capitalize, () => {
  test("capitalizes", () => {
    expect.hasAssertions();

    expect(capitalize("")).toBe("");
    expect(capitalize("a")).toBe("A");
    expect(capitalize("A")).toBe("A");
    expect(capitalize("0")).toBe("0");
    expect(capitalize("aa")).toBe("Aa");
    expect(capitalize("aA")).toBe("AA");
    expect(capitalize("a0")).toBe("A0");
    expect(capitalize("Aa")).toBe("Aa");
    expect(capitalize("AA")).toBe("AA");
    expect(capitalize("A0")).toBe("A0");
    expect(capitalize("0a")).toBe("0a");
    expect(capitalize("0A")).toBe("0A");
    expect(capitalize("00")).toBe("00");
    expect(capitalize(" a")).toBe(" a");
    expect(capitalize(" A")).toBe(" A");
    expect(capitalize(" 0")).toBe(" 0");
  });
});
