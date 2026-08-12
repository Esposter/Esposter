import { columnFormSchema, ColumnTypeFormSchemaMap } from "@/models/resource/sheet/column/ColumnForm";
import { describe, expect, test } from "vitest";

describe("columnFormSchema", () => {
  test("has an arm for every column type", () => {
    expect.hasAssertions();

    expect(columnFormSchema.options).toStrictEqual(Object.values(ColumnTypeFormSchemaMap));
  });
});
