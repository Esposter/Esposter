import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { deserializeJson } from "@/services/tableEditor/file/json/deserializeJson";
import { InvalidOperationError, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeJson, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Json].mimeType;

  const createFile = (content: string, name = "test.json") => new File([content], name, { type: MIME_TYPE });

  test("parses columns and rows from JSON array", async () => {
    expect.hasAssertions();

    const file = createFile(
      JSON.stringify([
        { a: 0, b: 1 },
        { a: 2, b: 3 },
      ]),
    );
    const { columns, rows } = await deserializeJson(file, new JsonDataSourceItem());

    expect(columns).toHaveLength(2);
    expect(takeOne(columns, 0).name).toBe("a");
    expect(takeOne(columns, 0).type).toBe(ColumnType.Number);
    expect(takeOne(columns, 1).name).toBe("b");
    expect(rows).toHaveLength(2);
    expect(takeOne(rows, 0).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("empty array returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const file = createFile("[]");
    const { columns, metadata, rows } = await deserializeJson(file, new JsonDataSourceItem());

    expect(columns).toHaveLength(0);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Json);
  });

  test("throws InvalidOperationError on non-array JSON", async () => {
    expect.hasAssertions();

    const file = createFile(JSON.stringify({ a: 0 }));

    await expect(deserializeJson(file, new JsonDataSourceItem())).rejects.toBeInstanceOf(InvalidOperationError);
  });
});
