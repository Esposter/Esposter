import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { getVisibleEditableColumns } from "@/services/resource/sheet/column/getVisibleEditableColumns";
import { describe, expect, test } from "vitest";

describe(getVisibleEditableColumns, () => {
  // A row form renders a field per column it is handed, so a hidden column left in would let the add-row and
  // Edit-row dialogs write into a column the grid does not show
  test("keeps only the visible columns the form can write", () => {
    expect.hasAssertions();

    const columns = [
      new StringColumn({ name: "" }),
      new NumberColumn({ isHidden: true, name: " " }),
      new ComputedColumn({ name: "a" }),
    ];

    expect(getVisibleEditableColumns(columns).map(({ name }) => name)).toStrictEqual([""]);
  });
});
