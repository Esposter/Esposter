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

  // A Sheet of the given columns and rows, saved as the first content of a new resource for a command to run on
  const createSheet = async (columns: Column[], rows: Row[]) => {
    const newResource = await caller.createResource({ name });
    const sheetResource: SheetResource = {
      data: {
        columns,
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
        rows,
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    await caller.saveResourceContent({
      content: sheetResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    return newResource.id;
  };

  test("Column rename re-keys every row", async () => {
    expect.hasAssertions();

    const id = await createSheet([new StringColumn({ name: "old" })], [new Row({ data: { old: "value" } })]);

    await caller.runSheetCommand({
      command: { name: "old", type: CommandType.UpdateColumn, updatedColumn: new StringColumn({ name: "new" }) },
      id,
    });
    const content = await caller.readResourceContent({ id });

    expect(content?.data.columns.map(({ name: columnName }) => columnName)).toStrictEqual(["new"]);
    expect(content?.data.rows.map(({ data }) => data)).toStrictEqual([{ new: "value" }]);
  });

  test("Column type change converts every cell", async () => {
    expect.hasAssertions();

    const id = await createSheet(
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

  test("Date format change rewrites every date", async () => {
    expect.hasAssertions();

    const id = await createSheet(
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
});
