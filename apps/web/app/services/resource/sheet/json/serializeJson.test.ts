import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { JSON_MIME_TYPE, JSON_SETTINGS } from "@/services/resource/sheet/json/constants.test";
import { createJsonFile } from "@/services/resource/sheet/json/createJsonFile.test";
import { deserializeJson } from "@/services/resource/sheet/json/deserializeJson";
import { serializeJson } from "@/services/resource/sheet/json/serializeJson";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const roundTrip = async (dataSource: DataSource) => {
  const blob = await serializeJson(dataSource, JSON_SETTINGS, JSON_MIME_TYPE);
  return deserializeJson(createJsonFile(blob), JSON_SETTINGS);
};

describe(serializeJson, () => {
  test("serializes rows to JSON array with column names as keys", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );
    const blob = await serializeJson(dataSource, JSON_SETTINGS, JSON_MIME_TYPE);
    const text = await blob.text();

    expect(jsonDateParse(text)).toStrictEqual([
      { a: 0, b: 1 },
      { a: 2, b: 3 },
    ]);
  });

  test("empty rows produces empty array", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);
    const blob = await serializeJson(dataSource, JSON_SETTINGS, JSON_MIME_TYPE);
    const text = await blob.text();

    expect(jsonDateParse(text)).toStrictEqual([]);
  });

  test("round trips cells containing a delimiter, a double quote and a newline", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: "0,1", b: 'say "hi"', c: "0\n1" })],
    );
    const { rows } = await roundTrip(dataSource);

    expect(rows).toHaveLength(1);
    expect(takeOne(rows).data).toStrictEqual({ a: "0,1", b: 'say "hi"', c: "0\n1" });
  });

  test("a null cell round trips as null", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: null })]);
    const { rows } = await roundTrip(dataSource);

    expect(takeOne(rows).data).toStrictEqual({ a: null });
  });
});
