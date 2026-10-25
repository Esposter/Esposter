import type { TRPCRouter } from "#server/trpc/routers";
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

// The content of a Sheet of the given columns and rows, with the metadata and settings every Sheet carries
const createSheetResource = (columns: Column[], rows: Row[]): SheetResource => ({
  data: { columns, metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 }, rows },
  settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
});

describe("sheetRouter", () => {
  const { getCaller } = setupResourceSuite(sheetRouter);
  let caller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";

  beforeAll(() => {
    caller = getCaller();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Sheet);

    const sheetResource: SheetResource = {
      data: {
        columns: [],
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
        rows: [],
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    await caller.saveResourceContent({
      content: sheetResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(sheetResource)));
  });

  test("reads a cell holding an ISO datetime as a string", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const column = new StringColumn({ name });
    // A full ISO datetime is exactly the shape `jsonDateParse` would revive into a Date, which
    // `columnValueSchema` (boolean | null | number | string) would then reject — so the cell has to come back
    // As the string it was stored as
    const cell = new Date(0).toISOString();
    const row = new Row({ data: { [column.id]: cell } });
    const sheetResource: SheetResource = {
      data: {
        columns: [column],
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
        rows: [row],
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    await caller.saveResourceContent({
      content: sheetResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content?.data.rows[0]?.data[column.id]).toBe(cell);
  });

  // A Sheet saved as the first content of a new resource, for a command to run on; answers the saved resource
  const createSheet = async (columns: Column[], rows: Row[]) => {
    const newResource = await caller.createResource({ name });
    return caller.saveResourceContent({
      content: createSheetResource(columns, rows),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
  };

  test("column rename re-keys every row", async () => {
    expect.hasAssertions();

    const { id } = await createSheet([new StringColumn({ name: "old" })], [new Row({ data: { old: "value" } })]);

    await caller.runSheetCommand({
      command: { name: "old", type: CommandType.UpdateColumn, updatedColumn: new StringColumn({ name: "new" }) },
      id,
    });
    const content = await caller.readResourceContent({ id });

    expect(content?.data.columns.map(({ name: columnName }) => columnName)).toStrictEqual(["new"]);
    expect(content?.data.rows.map(({ data }) => data)).toStrictEqual([{ new: "value" }]);
  });

  test("a column rename onto another column's name is refused and leaves the cells alone", async () => {
    expect.hasAssertions();

    const { id } = await createSheet(
      [new StringColumn({ name: "a" }), new StringColumn({ name: "b" })],
      [new Row({ data: { a: "1", b: "2" } })],
    );

    await expect(
      caller.runSheetCommand({
        command: { name: "a", type: CommandType.UpdateColumn, updatedColumn: new StringColumn({ name: "b" }) },
        id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: a, a column named "b" already exists]`,
    );
    const content = await caller.readResourceContent({ id });

    expect(content?.data.columns.map(({ name: columnName }) => columnName)).toStrictEqual(["a", "b"]);
    expect(content?.data.rows.map(({ data }) => data)).toStrictEqual([{ a: "1", b: "2" }]);
  });

  test("column type change converts every cell", async () => {
    expect.hasAssertions();

    const { id } = await createSheet(
      [new StringColumn({ name: "amount" })],
      [new Row({ data: { amount: "12" } }), new Row({ data: { amount: "x" } })],
    );

    await caller.runSheetCommand({
      command: { name: "amount", type: CommandType.UpdateColumn, updatedColumn: new NumberColumn({ name: "amount" }) },
      id,
    });
    const content = await caller.readResourceContent({ id });

    expect(content?.data.rows.map(({ data }) => data.amount)).toStrictEqual([12, null]);
  });

  test("date format change rewrites every date", async () => {
    expect.hasAssertions();

    const { id } = await createSheet(
      [new DateColumn({ format: DateFormat["YYYY/MM/DD"], name: "day" })],
      [new Row({ data: { day: "2026/10/25" } })],
    );

    await caller.runSheetCommand({
      command: {
        name: "day",
        type: CommandType.UpdateColumn,
        updatedColumn: new DateColumn({ format: DateFormat["DD-MM-YYYY"], name: "day" }),
      },
      id,
    });
    const content = await caller.readResourceContent({ id });

    expect(content?.data.rows.map(({ data }) => data.day)).toStrictEqual(["25-10-2026"]);
  });

  test("a command lands on its row after a row is inserted above it", async () => {
    expect.hasAssertions();

    const column = new StringColumn({ name: "status" });
    const firstRow = new Row({ data: { status: "open" } });
    const row = new Row({ data: { status: "open" } });
    const { contentVersion, id } = await createSheet([column], [firstRow, row]);
    // The owner inserts a row above the one the agent names
    const insertedRow = new Row({ data: { status: "inserted" } });
    await caller.saveResourceContent({
      content: createSheetResource([column], [insertedRow, firstRow, row]),
      contentVersion,
      id,
    });

    await caller.runSheetCommand({
      command: { data: { status: "done" }, rowId: row.id, type: CommandType.UpdateRow },
      id,
    });
    const content = await caller.readResourceContent({ id });

    expect(content?.data.rows.map(({ data }) => data.status)).toStrictEqual(["inserted", "open", "done"]);
  });

  test("a command based on older content applies to the newer content", async () => {
    expect.hasAssertions();

    const column = new StringColumn({ name: "status" });
    const firstRow = new Row({ data: { status: "open" } });
    const row = new Row({ data: { status: "open" } });
    const { contentVersion, id } = await createSheet([column], [firstRow, row]);
    // The owner edits the first row after the agent read the Sheet
    await caller.saveResourceContent({
      content: createSheetResource([column], [new Row({ data: { status: "edited" }, id: firstRow.id }), row]),
      contentVersion,
      id,
    });

    await caller.runSheetCommand({
      command: { data: { status: "done" }, rowId: row.id, type: CommandType.UpdateRow },
      id,
    });
    const content = await caller.readResourceContent({ id });

    expect(content?.data.rows.map(({ data }) => data.status)).toStrictEqual(["edited", "done"]);
  });
});
