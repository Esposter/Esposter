import { escapeValue } from "@/services/azure/transformer/escapeValue";
import { describe, expect, test } from "vitest";

describe(escapeValue, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(escapeValue("")).toBe("''");
  });
});
