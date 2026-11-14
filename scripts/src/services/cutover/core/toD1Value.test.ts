import type { CoreColumn } from "#src/models/cutover/CoreColumn";

import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { assert, describe, expect, test } from "vitest";

const createColumn = (dataType: string, notNull = true): CoreColumn => ({ dataType, name: "value", notNull });

describe(toD1Value, () => {
  test("stores a timestamp as epoch milliseconds", () => {
    expect.hasAssertions();

    expect(toD1Value(createColumn("object date"), new Date(1_700_000_000_123))).toBe(1_700_000_000_123);
  });

  test("stores a real column the schema declares as its number", () => {
    expect.hasAssertions();

    const column = getCoreTables()
      .find(({ name }) => name === "post_posts")
      ?.columns.find(({ name }) => name === "ranking");

    assert(column);

    expect(toD1Value(column, 1.5)).toBe(1.5);
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

  test("stores a bitfield as its decimal text, exact past 2^53", () => {
    expect.hasAssertions();

    expect(toD1Value(createColumn("custom"), "9007199254740993")).toBe("9007199254740993");
  });
});
