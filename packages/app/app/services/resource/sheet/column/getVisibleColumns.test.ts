import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { describe, expect, test } from "vitest";

const createColumn = (name: string, hidden: boolean) => new StringColumn({ hidden, name });

describe(getVisibleColumns, () => {
  test("keeps only the columns the user can see, in order", () => {
    expect.hasAssertions();

    const columns = [createColumn("first", false), createColumn("second", true), createColumn("third", false)];

    expect(getVisibleColumns(columns).map(({ name }) => name)).toStrictEqual(["first", "third"]);
  });

  test("returns every column when none is hidden", () => {
    expect.hasAssertions();

    const columns = [createColumn("first", false), createColumn("second", false)];

    expect(getVisibleColumns(columns)).toStrictEqual(columns);
  });
});
