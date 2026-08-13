import { BooleanFormat } from "#shared/models/resource/sheet/column/BooleanFormat";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { USD_CURRENCY_FORMATTER } from "#shared/services/intl/constants";
import { createBooleanColumn } from "@/composables/resource/sheet/commands/createBooleanColumn.test";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDateColumn } from "@/composables/resource/sheet/commands/createDateColumn.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { getDisplayText } from "@/services/resource/sheet/column/getDisplayText";
import { describe, expect, test } from "vitest";

describe(getDisplayText, () => {
  const name = "name";

  test("renders a boolean through its column's format", () => {
    expect.hasAssertions();

    const column = createBooleanColumn(name);
    column.format = BooleanFormat.YesNo;

    expect(getDisplayText(true, column)).toBe("Yes");
    expect(getDisplayText(false, column)).toBe("No");
  });

  test("renders a number through its column's format", () => {
    expect.hasAssertions();

    const column = createNumberColumn(name);
    column.format = NumberFormat.Currency;

    expect(getDisplayText(1234, column)).toBe(USD_CURRENCY_FORMATTER.format(1234));
  });

  test("renders a date through its column's format", () => {
    expect.hasAssertions();

    expect(getDisplayText("1970-01-01", createDateColumn(name, DateFormat["DD/MM/YYYY"]))).toBe("01/01/1970");
  });

  test("renders a column with no format chosen as its raw value", () => {
    expect.hasAssertions();

    expect(getDisplayText(1234, createNumberColumn(name))).toBe("1234");
  });

  test("renders a column type that has no format at all as its raw value", () => {
    expect.hasAssertions();

    expect(getDisplayText("value", createColumn(name))).toBe("value");
    expect(getDisplayText(1234, createComputedColumn(name, ""))).toBe("1234");
  });

  test("renders an empty cell as empty text", () => {
    expect.hasAssertions();

    const column = createNumberColumn(name);
    column.format = NumberFormat.Currency;

    expect(getDisplayText(null, column)).toBe("");
  });

  // A format only knows how to render the type it belongs to, so a value the column's type no longer matches
  // Would otherwise disappear from the grid entirely
  test("renders a value its column's format cannot handle as the raw value", () => {
    expect.hasAssertions();

    const column = createNumberColumn(name);
    column.format = NumberFormat.Currency;

    expect(getDisplayText("value", column)).toBe("value");
  });
});
