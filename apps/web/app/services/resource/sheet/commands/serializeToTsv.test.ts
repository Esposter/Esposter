import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { serializeToTsv } from "@/services/resource/sheet/commands/serializeToTsv";
import { describe, expect, test } from "vitest";

describe(serializeToTsv, () => {
  test("produces header row followed by data rows in TSV format", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "0", b: "1" })]);
    expect(serializeToTsv(dataSource)).toBe("a\tb\n0\t1");
  });

  test("produces only header row when no rows", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);
    expect(serializeToTsv(dataSource)).toBe("a");
  });

  test("replaces tab, newline and carriage return characters in cell values with spaces", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "w\tx\ny\rz" })]);
    expect(serializeToTsv(dataSource)).toBe("a\nw x y z");
  });

  test("replaces tab characters in column names with spaces", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a\tb")], [createRow({ "a\tb": "0" })]);
    expect(serializeToTsv(dataSource)).toBe("a b\n0");
  });
});
