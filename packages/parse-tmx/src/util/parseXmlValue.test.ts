import { parseXmlValue } from "@/util/parseXmlValue";
import { describe, expect, test } from "vitest";

describe(parseXmlValue, () => {
  test("parses", () => {
    expect.hasAssertions();

    expect(parseXmlValue("true")).toBe(true);
    expect(parseXmlValue("false")).toBe(false);
    expect(parseXmlValue("0")).toBe(0);
    expect(parseXmlValue("")).toBe("");
  });
});
