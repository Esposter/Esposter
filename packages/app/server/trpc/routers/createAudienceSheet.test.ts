import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Resource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { describe } from "vitest";

// The audience column every funnel fixture keys recipients on
export const AUDIENCE_KEY_COLUMN = "email";

// A Sheet of recipients — the audience every program binds. keyValues drives one row per recipient
export const createAudienceSheet = async (
  sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>,
  name: string,
  keyValues: string[],
): Promise<Resource> => {
  const newResource = await sheetCaller.createResource({ name });
  const sheetResource: SheetResource = {
    data: {
      columns: [new StringColumn({ name: AUDIENCE_KEY_COLUMN })],
      metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
      rows: keyValues.map((keyValue) => new Row({ data: { [AUDIENCE_KEY_COLUMN]: keyValue } })),
    },
    settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
  };
  await sheetCaller.saveResourceContent({
    content: sheetResource,
    contentVersion: newResource.contentVersion,
    id: newResource.id,
  });
  return newResource;
};

describe.todo("createAudienceSheet");
