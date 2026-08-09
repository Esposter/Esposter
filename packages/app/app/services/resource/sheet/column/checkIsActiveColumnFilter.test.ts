import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { checkIsActiveColumnFilter } from "@/services/resource/sheet/column/checkIsActiveColumnFilter";
import { describe, expect, test } from "vitest";

describe(checkIsActiveColumnFilter, () => {
  test("a filter carrying a value is active", () => {
    expect.hasAssertions();
    expect(checkIsActiveColumnFilter({ type: ColumnType.String, value: "abc" })).toBe(true);
    expect(checkIsActiveColumnFilter({ type: ColumnType.Boolean, value: BooleanValue.True })).toBe(true);
    expect(checkIsActiveColumnFilter({ maximum: "", minimum: "0", type: ColumnType.Number })).toBe(true);
    expect(checkIsActiveColumnFilter({ maximum: "10", minimum: "", type: ColumnType.Number })).toBe(true);
  });

  test("a filter with every value empty is inactive", () => {
    expect.hasAssertions();
    expect(checkIsActiveColumnFilter({ type: ColumnType.String, value: "" })).toBe(false);
    expect(checkIsActiveColumnFilter({ type: ColumnType.Boolean, value: "" })).toBe(false);
    expect(checkIsActiveColumnFilter({ maximum: "", minimum: "", type: ColumnType.Number })).toBe(false);
  });
});
