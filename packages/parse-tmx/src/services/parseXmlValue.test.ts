import { parseXmlValue } from "#src/services/parseXmlValue";
import { describe, expect, test } from "vitest";

describe(parseXmlValue, () => {
  test("parses", () => {
    expect.hasAssertions();

    expect(parseXmlValue("true")).toBe(true);
    expect(parseXmlValue("false")).toBe(false);
    expect(parseXmlValue("0")).toBe(0);
    expect(parseXmlValue("+0")).toBe(0);
    expect(parseXmlValue("-0.1")).toBe(-0.1);
    expect(parseXmlValue("")).toBe("");
    // Only the plain decimal shape is numeric; anything else stays a string
    expect(parseXmlValue("0e0")).toBe("0e0");
    expect(parseXmlValue("0.")).toBe("0.");
  });
});
