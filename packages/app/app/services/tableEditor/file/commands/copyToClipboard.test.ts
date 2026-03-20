import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { takeOne } from "@esposter/shared";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(copyToClipboard, () => {
  let written = "";

  beforeAll(() => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: (text: string) => {
          written = text;
        },
      },
    });
  });

  beforeEach(() => {
    written = "";
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test("copies all rows when no rowIds passed", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
    await copyToClipboard(dataSource);
    const lines = written.split("\n");

    expect(takeOne(lines, 0)).toBe("| a | b |");
    expect(takeOne(lines, 2)).toBe("| 0 | 1 |");
  });

  test("copies empty rows when rowIds is empty array", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: "0" })]);
    await copyToClipboard(dataSource, []);
    const lines = written.split("\n");

    expect(lines).toHaveLength(2);
    expect(takeOne(lines, 0)).toBe("| a |");
  });

  test("copies only selected rows when rowIds passed", async () => {
    expect.hasAssertions();

    const row = makeRow({ a: "0" });
    const dataSource = makeDataSource([makeColumn("a")], [row, makeRow({ a: "1" })]);
    await copyToClipboard(dataSource, [row.id]);
    const lines = written.split("\n");

    expect(lines).toHaveLength(3);
    expect(takeOne(lines, 2)).toBe("| 0 |");
  });
});
