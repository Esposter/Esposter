import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { formatOptionalColumnValue } from "@/services/resource/sheet/column/formatOptionalColumnValue";
import { getDisplayText } from "@/services/resource/sheet/column/getDisplayText";
import { describe, expect, test } from "vitest";

describe(formatOptionalColumnValue, () => {
  const column = { format: NumberFormat.Currency, name: "amount", type: ColumnType.Number } as NumberColumn;

  // A sum sitting under a column of formatted cells is in those same units, so showing it bare reads as a
  // Different quantity from the rows it totals
  test("shows a statistic in the units its column's cells are shown in", () => {
    expect.hasAssertions();

    expect(formatOptionalColumnValue(1234.5, column)).toBe(getDisplayText(1234.5, column));
  });

  test("shows an em dash for a statistic that has no value", () => {
    expect.hasAssertions();

    expect(formatOptionalColumnValue(undefined, column)).toBe("—");
  });
});
