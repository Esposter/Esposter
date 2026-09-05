import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("sheetRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(sheetRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(resources);
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
    const column = new StringColumn({ name: "column", sourceName: "column" });
    // A full ISO datetime is exactly the shape `jsonDateParse` would revive into a Date, which
    // `columnValueSchema` (boolean | null | number | string) would then reject — so the cell has to come back
    // As the string it was stored as
    const cell = "2026-07-15T09:00:00Z";
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
});
