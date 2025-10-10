import { deserializeValue } from "@/services/azure/transformer/deserializeValue";
import { escapeValue } from "@/services/azure/transformer/escapeValue";
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
});
