import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { JSON_SETTINGS } from "@/services/resource/sheet/json/constants.test";
import { createJsonFile } from "@/services/resource/sheet/json/createJsonFile.test";
import { deserializeJson } from "@/services/resource/sheet/json/deserializeJson";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeJson, () => {
  test("parses columns and rows from JSON array", async () => {
    expect.hasAssertions();

    const file = createJsonFile(
      JSON.stringify([
        { a: 0, b: 1 },
        { a: 2, b: 3 },
      ]),
    );
    const { columns, rows } = await deserializeJson(file, JSON_SETTINGS);

    expect(columns).toHaveLength(2);
    expect(takeOne(columns).name).toBe("a");
    expect(takeOne(columns).type).toBe(ColumnType.Number);
    expect(takeOne(columns, 1).name).toBe("b");
    expect(rows).toHaveLength(2);
    expect(takeOne(rows).data).toStrictEqual({ a: 0, b: 1 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 2, b: 3 });
  });

  test("empty array returns DataSource with no columns and rows", async () => {
    expect.hasAssertions();

    const file = createJsonFile("[]");
    const { columns, metadata, rows } = await deserializeJson(file, JSON_SETTINGS);

    expect(columns).toHaveLength(0);
    expect(rows).toHaveLength(0);
    expect(metadata.dataSourceType).toBe(DataSourceType.Json);
  });

  test("throws InvalidOperationError on non-array JSON", async () => {
    expect.hasAssertions();

    const file = createJsonFile(JSON.stringify({ a: 0 }));

    await expect(deserializeJson(file, JSON_SETTINGS)).rejects.toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: a.json, [
        {
          "expected": "array",
          "code": "invalid_type",
          "path": [],
          "message": "Invalid input: expected array, received object"
        }
      ]]
    `);
  });
});
