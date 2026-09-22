import { deserializeValue } from "#src/services/transformer/deserializeValue";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { describe, expect, test } from "vitest";

describe(deserializeValue, () => {
  const epoch = new Date(0);

  test("deserializes", () => {
    expect.hasAssertions();

    expect(deserializeValue(String(true))).toBe(true);
    expect(deserializeValue(epoch.toISOString())).toStrictEqual(epoch);
    expect(deserializeValue(escapeValue(""))).toBe("");
    expect(deserializeValue(String(null))).toBeNull();
    expect(deserializeValue("0")).toBe(0);
    expect(deserializeValue(String(Number.NaN))).toBe(Number.NaN);
  });

  test("round-trips a value carrying the literal delimiter", () => {
    expect.hasAssertions();

    const value = "'";

    expect(deserializeValue(escapeValue(value))).toBe(value);
  });

  test("keeps a date the calendar lacks as the string it was", () => {
    expect.hasAssertions();

    const missingMonthDate = "1970-13-01";
    const missingDayDate = "1970-02-30T00:00:00.000Z";
    const missingDayLiteral = `datetime'${missingDayDate}'`;

    expect(deserializeValue(missingMonthDate)).toBe(missingMonthDate);
    expect(deserializeValue(missingDayDate)).toBe(missingDayDate);
    expect(deserializeValue(missingDayLiteral)).toBe(missingDayLiteral);
  });

  test("parses an Azure Table datetime literal back to a Date", () => {
    expect.hasAssertions();

    expect(deserializeValue(`datetime'${epoch.toISOString()}'`)).toStrictEqual(epoch);
  });
});
