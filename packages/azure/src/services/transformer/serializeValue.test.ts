import { escapeValue } from "#src/services/transformer/escapeValue";
import { serializeValue } from "#src/services/transformer/serializeValue";
import { describe, expect, test } from "vitest";

describe(serializeValue, () => {
  const epoch = new Date(0);

  test("serializes", () => {
    expect.hasAssertions();

    expect(serializeValue(true)).toBe(String(true));
    expect(serializeValue(epoch)).toBe(epoch.toISOString());
    expect(serializeValue("")).toBe(escapeValue(""));
    expect(serializeValue(null)).toBe(String(null));
    expect(serializeValue(0)).toBe("0");
    expect(serializeValue(Number.NaN)).toBe(String(Number.NaN));
  });

  test("wraps a Date in a datetime literal for a table filter", () => {
    expect.hasAssertions();

    expect(serializeValue(epoch, true)).toBe(`datetime'${epoch.toISOString()}'`);
  });
});
