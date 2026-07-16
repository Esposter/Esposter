import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic resource-procedure matrix is covered once in createResourceProcedures.test.ts;
// Here only the router wiring: resource type + content schema round-trip.
describe("sheet", () => {
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
        statistics: { columnCount: 0, rowCount: 0, size: 0 },
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
});
