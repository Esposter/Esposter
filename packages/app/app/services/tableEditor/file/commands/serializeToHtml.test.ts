import { createColumn } from "@/composables/tableEditor/file/commands/createColumn.test";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";
import { createRow } from "@/composables/tableEditor/file/commands/createRow.test";
import { serializeToHtml } from "@/services/tableEditor/file/commands/serializeToHtml";
import { describe, expect, test } from "vitest";

describe(serializeToHtml, () => {
  test("produces a table with header and data rows", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "0", b: "1" })]);

    expect(serializeToHtml(dataSource)).toBe(
      "<table><tr><th>a</th><th>b</th></tr><tr><td>0</td><td>1</td></tr></table>",
    );
  });

  test("produces a table with only a header row when no rows", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);

    expect(serializeToHtml(dataSource)).toBe("<table><tr><th>a</th></tr></table>");
  });

  test("renders null cell values as empty strings", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "0" })]);

    expect(serializeToHtml(dataSource)).toBe(
      "<table><tr><th>a</th><th>b</th></tr><tr><td>0</td><td></td></tr></table>",
    );
  });

  test("escapes HTML characters", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a&")], [createRow({ "a&": "<br>" })]);

    expect(serializeToHtml(dataSource)).toBe("<table><tr><th>a&amp;</th></tr><tr><td>&lt;br&gt;</td></tr></table>");
  });
});
