import { columnFormSchema } from "#src/models/resource/sheet/column/ColumnForm";
import { ColumnTypeFormSchemaMap } from "#src/services/resource/sheet/column/ColumnTypeFormSchemaMap";
import { describe, expect, test } from "vitest";

describe("columnFormSchema", () => {
  test("has an arm for every column type", () => {
    expect.hasAssertions();

    expect(columnFormSchema.options).toStrictEqual(Object.values(ColumnTypeFormSchemaMap));
  });
});
