import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { makeColumn, makeDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseClipboardRows, () => {
  const csvItem = new CsvDataSourceItem();

  test("maps matching columns to correct values", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = await parseClipboardRows("a,b\n0,1", dataSource, csvItem);

    expect(rows).toHaveLength(1);
    expect(takeOne(rows, 0).data.a).toBe("0");
    expect(takeOne(rows, 0).data.b).toBe("1");
  });

  test("initializes unmatched columns to null", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = await parseClipboardRows("a\n0", dataSource, csvItem);

    expect(takeOne(rows, 0).data.b).toBeNull();
  });

  test("ignores extra columns not in dataSource", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = await parseClipboardRows("a,extra\n0,ignored", dataSource, csvItem);

    expect(Object.keys(takeOne(rows, 0).data)).toEqual(["a"]);
  });

  test("matching is case-sensitive", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = await parseClipboardRows("A\n0", dataSource, csvItem);

    expect(takeOne(rows, 0).data.a).toBeNull();
  });

  test("returns empty array when no data rows", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = await parseClipboardRows("a", dataSource, csvItem);

    expect(rows).toHaveLength(0);
  });

  test("uses item delimiter", async () => {
    expect.hasAssertions();

    const tabItem = new CsvDataSourceItem({ configuration: { delimiter: CsvDelimiter.Tab } });
    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = await parseClipboardRows("a\tb\n0\t1", dataSource, tabItem);

    expect(takeOne(rows, 0).data.a).toBe("0");
  });
});
