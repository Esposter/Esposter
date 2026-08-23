import { escapeValue } from "#src/services/transformer/escapeValue.ts";
import { serializeValue } from "#src/services/transformer/serializeValue.ts";
import { describe, expect, test } from "vitest";

describe(serializeValue, () => {
  test("serializes", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(serializeValue(true)).toBe(String(true));
    expect(serializeValue(epoch)).toBe(epoch.toISOString());
    expect(serializeValue("")).toBe(escapeValue(""));
    expect(serializeValue(null)).toBe(String(null));
    expect(serializeValue(0)).toBe("0");
    expect(serializeValue(Number.NaN)).toBe(String(Number.NaN));
  });

  test("wraps a Date in a datetime literal for a table filter", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(serializeValue(epoch, true)).toBe(`datetime'${epoch.toISOString()}'`);
  });
});
