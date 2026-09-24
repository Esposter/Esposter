import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { describe, expect, test } from "vitest";

const createVisibilityColumn = (name: string, isHidden: boolean) => new StringColumn({ isHidden, name });

describe(getVisibleColumns, () => {
  test("keeps only the columns the user can see, in order", () => {
    expect.hasAssertions();

    const columns = [
      createVisibilityColumn("", false),
      createVisibilityColumn(" ", true),
      createVisibilityColumn("a", false),
    ];

    expect(getVisibleColumns(columns).map(({ name }) => name)).toStrictEqual(["", "a"]);
  });

  test("returns every column when none is hidden", () => {
    expect.hasAssertions();

    const columns = [createVisibilityColumn("", false), createVisibilityColumn(" ", false)];

    expect(getVisibleColumns(columns)).toStrictEqual(columns);
  });
});
