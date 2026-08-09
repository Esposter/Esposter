import type { CsvFileSettings } from "#shared/models/resource/sheet/CsvFileSettings";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { deserializeCsv } from "@/services/resource/sheet/csv/deserializeCsv";
import { serializeCsv } from "@/services/resource/sheet/csv/serializeCsv";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const defaultSettings: CsvFileSettings = { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv };

describe(serializeCsv, () => {
  const MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Csv].mimeType;

  const serializeText = async (dataSource: DataSource, settings = defaultSettings) => {
    const blob = await serializeCsv(dataSource, settings, MIME_TYPE);
    return blob.text();
  };
  const roundTrip = async (dataSource: DataSource) => {
    const blob = await serializeCsv(dataSource, defaultSettings, MIME_TYPE);
    return deserializeCsv(new File([blob], "a.csv", { type: MIME_TYPE }), defaultSettings);
  };

  test("serializes columns and rows to CSV with comma delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );

    expect(await serializeText(dataSource)).toBe("a,b\n0,1\n2,3");
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: 0, b: 1 })]);
    const item = {
      configuration: { delimiter: CsvDelimiter.Semicolon },
      type: DataSourceType.Csv,
    } satisfies CsvFileSettings;

    expect(await serializeText(dataSource, item)).toBe("a;b\n0;1");
  });

  test("escapes cells containing the delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "0,1" })]);

    expect(await serializeText(dataSource)).toBe('a\n"0,1"');
  });

  test("escapes cells containing double quotes", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: 'say "hi"' })]);

    expect(await serializeText(dataSource)).toBe('a\n"say ""hi"""');
  });

  test("escapes cells containing newlines", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "0\n1" })]);

    expect(await serializeText(dataSource)).toBe('a\n"0\n1"');
  });

  test("escapes cells containing carriage returns", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "0\r1" })]);

    expect(await serializeText(dataSource)).toBe('a\n"0\r1"');
  });

  test("writes an empty field for a null or missing cell", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: null })]);

    expect(await serializeText(dataSource)).toBe("a,b\n,");
  });

  test("returns blob with correct mime type", async () => {
    expect.hasAssertions();

    const blob = await serializeCsv(createDataSource(), defaultSettings, MIME_TYPE);

    expect(blob.type).toBe(MIME_TYPE);
  });

  test("empty rows produces only header row", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);

    expect(await serializeText(dataSource)).toBe("a");
  });

  test("round trips cells containing the delimiter, a double quote and a null", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: "0,1", b: 'say "hi"', c: null })],
    );
    const { rows } = await roundTrip(dataSource);

    expect(rows).toHaveLength(1);
    expect(takeOne(rows).data).toStrictEqual({ a: "0,1", b: 'say "hi"', c: null });
  });

  test("a cell containing a newline round trips as two rows", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "0\n1" })]);
    const { rows } = await roundTrip(dataSource);

    expect(rows).toHaveLength(2);
    expect(takeOne(rows).data).toStrictEqual({ a: 0 });
    expect(takeOne(rows, 1).data).toStrictEqual({ a: 1 });
  });

  test("a whitespace-only cell round trips as null", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: " ", b: "0,1" })]);
    const { rows } = await roundTrip(dataSource);

    expect(takeOne(rows).data).toStrictEqual({ a: null, b: "0,1" });
  });
});
