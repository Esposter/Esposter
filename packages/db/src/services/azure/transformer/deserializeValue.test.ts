import { deserializeValue } from "#src/services/azure/transformer/deserializeValue";
import { escapeValue } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(deserializeValue, () => {
  test("deserializes", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(deserializeValue(String(true))).toBe(true);
    expect(deserializeValue(epoch.toISOString())).toStrictEqual(epoch);
    expect(deserializeValue(escapeValue(""))).toBe("");
    expect(deserializeValue(String(null))).toBeNull();
    expect(deserializeValue("0")).toBe(0);
    expect(deserializeValue(String(Number.NaN))).toBe(Number.NaN);
  });

  test("round-trips a value carrying the literal delimiter", () => {
    expect.hasAssertions();

    const value = "o'brien' or 1 eq 1";

    expect(deserializeValue(escapeValue(value))).toBe(value);
  });

  test("parses an Azure Table datetime literal back to a Date", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(deserializeValue(`datetime'${epoch.toISOString()}'`)).toStrictEqual(epoch);
  });
});
