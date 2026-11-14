import type { CoreColumn } from "#src/models/cutover/CoreColumn";

import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { describe, expect, test } from "vitest";

describe(toD1Value, () => {
  const createColumn = (dataType: string, notNull = true): CoreColumn => ({ dataType, name: "value", notNull });

  test("stores a timestamp as epoch milliseconds", () => {
    expect.hasAssertions();

    expect(toD1Value(createColumn("object date"), new Date(1_700_000_000_123))).toBe(1_700_000_000_123);
  });

  test("stores a boolean as 0 or 1 and a json value as its text", () => {
    expect.hasAssertions();

    expect(toD1Value(createColumn("boolean"), true)).toBe(1);
    expect(toD1Value(createColumn("object json"), { files: [] })).toBe('{"files":[]}');
  });

  test("keeps a non-null json column's JSON null as text, and a nullable one's as SQL NULL", () => {
    expect.hasAssertions();

    expect(toD1Value(createColumn("object json"), null)).toBe("null");
    expect(toD1Value(createColumn("object json", false), null)).toBeNull();
  });

  test("stores a bitfield as an integer and refuses one past 2^53, which a number would round", () => {
    expect.hasAssertions();

    expect(toD1Value(createColumn("custom"), "7")).toBe(7);
    expect(() => toD1Value(createColumn("custom"), "9007199254740993")).toThrowError(/cannot store exactly/u);
  });
});
