import { columnSchema } from "#shared/models/resource/sheet/column/Column";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { describe, expect, test } from "vitest";

describe("columnSchema", () => {
  test("has an arm for every column type", () => {
    expect.hasAssertions();

    expect(new Set(columnSchema.options.map((option) => option.shape.type.unwrap().value))).toStrictEqual(
      new Set(Object.values(ColumnType)),
    );
  });
});
