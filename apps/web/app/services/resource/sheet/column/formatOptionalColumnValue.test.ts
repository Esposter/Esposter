import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { USD_CURRENCY_FORMATTER } from "#shared/services/intl/constants";
import { formatOptionalColumnValue } from "@/services/resource/sheet/column/formatOptionalColumnValue";
import { describe, expect, test } from "vitest";

describe(formatOptionalColumnValue, () => {
  const column = createNumberColumn("name");
  column.format = NumberFormat.Currency;

  // A sum sitting under a column of formatted cells is in those same units, so showing it bare reads as a
  // Different quantity from the rows it totals
  test("shows a statistic in the units its column's cells are shown in", () => {
    expect.hasAssertions();

    expect(formatOptionalColumnValue(0.1, column)).toBe(USD_CURRENCY_FORMATTER.format(0.1));
  });

  test("shows an em dash for a statistic that has no value", () => {
    expect.hasAssertions();

    expect(formatOptionalColumnValue(undefined, column)).toBe("—");
  });
});
