import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(copyToClipboard, () => {
  const csvItem = new CsvDataSourceItem();

  test("copies all rows when no rowIds passed", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
    let written = "";
    vi.stubGlobal("navigator", { clipboard: { writeText: (text: string) => { written = text; } } });
    await copyToClipboard(dataSource, csvItem);
    const lines = written.split("\n");

    expect(takeOne(lines, 0)).toBe("a,b");
    expect(takeOne(lines, 1)).toBe("0,1");
  });

  test("copies empty rows when rowIds is empty array", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: "0" })]);
    let written = "";
    vi.stubGlobal("navigator", { clipboard: { writeText: (text: string) => { written = text; } } });
    await copyToClipboard(dataSource, csvItem, []);
    const lines = written.split("\n");

    expect(lines).toHaveLength(1);
    expect(takeOne(lines, 0)).toBe("a");
  });

  test("copies only selected rows when rowIds passed", async () => {
    expect.hasAssertions();

    const row = makeRow({ a: "0" });
    const dataSource = makeDataSource([makeColumn("a")], [row, makeRow({ a: "1" })]);
    let written = "";
    vi.stubGlobal("navigator", { clipboard: { writeText: (text: string) => { written = text; } } });
    await copyToClipboard(dataSource, csvItem, [row.id]);
    const lines = written.split("\n");

    expect(lines).toHaveLength(2);
    expect(takeOne(lines, 1)).toBe("0");
  });

  test("uses item delimiter for csv", async () => {
    expect.hasAssertions();

    const tabItem = new CsvDataSourceItem({ configuration: { delimiter: CsvDelimiter.Tab } });
    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
    let written = "";
    vi.stubGlobal("navigator", { clipboard: { writeText: (text: string) => { written = text; } } });
    await copyToClipboard(dataSource, tabItem);

    expect(takeOne(written.split("\n"), 0)).toBe("a\tb");
  });
});
