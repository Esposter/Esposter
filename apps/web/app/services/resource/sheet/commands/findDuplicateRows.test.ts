import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { describe, expect, test } from "vitest";

describe(findDuplicateRows, () => {
  // The deduplicate acts on what is on screen, so a hidden column is no part of the key a row is matched on
  test("a hidden column does not make two rows distinct", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn(""), new StringColumn({ isHidden: true, name: " " })],
      [createRow({ "": "0", " ": "" }), createRow({ "": "0", " ": " " })],
    );

    expect(findDuplicateRows(dataSource).map(({ index }) => index)).toStrictEqual([1]);
  });
});
