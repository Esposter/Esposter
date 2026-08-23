import { parseXmlValue } from "#src/util/parseXmlValue";
import { describe, expect, test } from "vitest";

describe(parseXmlValue, () => {
  test("parses", () => {
    expect.hasAssertions();

    expect(parseXmlValue("true")).toBe(true);
    expect(parseXmlValue("false")).toBe(false);
    expect(parseXmlValue("0")).toBe(0);
    expect(parseXmlValue("+2")).toBe(2);
    expect(parseXmlValue("-1.5")).toBe(-1.5);
    expect(parseXmlValue("")).toBe("");
    // Only the plain decimal shape is numeric; anything else stays a string
    expect(parseXmlValue("1e3")).toBe("1e3");
    expect(parseXmlValue("1.")).toBe("1.");
  });
});
