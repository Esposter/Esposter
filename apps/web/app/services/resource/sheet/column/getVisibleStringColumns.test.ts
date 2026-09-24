import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { getVisibleStringColumns } from "@/services/resource/sheet/column/getVisibleStringColumns";
import { describe, expect, test } from "vitest";

describe(getVisibleStringColumns, () => {
  test("keeps only the string columns the user can see", () => {
    expect.hasAssertions();

    const columns = [
      new StringColumn({ name: "" }),
      new StringColumn({ isHidden: true, name: " " }),
      new NumberColumn({ name: "a" }),
    ];

    expect(getVisibleStringColumns(columns).map(({ name }) => name)).toStrictEqual([""]);
  });
});
