import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { CSV_MIME_TYPE, CSV_SEMICOLON_SETTINGS, CSV_SETTINGS } from "#src/services/resource/sheet/csv/constants.test";
import { createCsvFile } from "#src/services/resource/sheet/csv/createCsvFile.test";
import { deserializeCsv } from "#src/services/resource/sheet/csv/deserializeCsv";
import { serializeCsv } from "#src/services/resource/sheet/csv/serializeCsv";
import { describe, expect, test } from "vitest";

const serializeText = async (dataSource: DataSource, settings = CSV_SETTINGS) => {
  const blob = await serializeCsv(dataSource, settings, CSV_MIME_TYPE);
  return blob.text();
};

const roundTrip = async (dataSource: DataSource) => {
  const blob = await serializeCsv(dataSource, CSV_SETTINGS, CSV_MIME_TYPE);
  return deserializeCsv(createCsvFile(blob), CSV_SETTINGS);
};

describe(serializeCsv, () => {
  test("serializes columns and rows to CSV with comma delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b")],
      [createRow({ a: 0, b: 1 }), createRow({ a: 2, b: 3 })],
    );

    await expect(serializeText(dataSource)).resolves.toBe("a,b\n0,1\n2,3");
  });

  test("uses specified delimiter", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: 0, b: 1 })]);

    await expect(serializeText(dataSource, CSV_SEMICOLON_SETTINGS)).resolves.toBe("a;b\n0;1");
  });

  test("writes an empty field for a null or missing cell", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: null })]);

    await expect(serializeText(dataSource)).resolves.toBe("a,b\n,");
  });

  test("empty rows produces only header row", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);

    await expect(serializeText(dataSource)).resolves.toBe("a");
  });

  test("round trips cells containing the delimiter, a double quote and a null", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: "0,1", b: '"', c: null })],
    );
    const { rows } = await roundTrip(dataSource);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: "0,1", b: '"', c: null }]);
  });

  test("a cell containing a newline round trips as one row", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "0\n1" })]);
    const { rows } = await roundTrip(dataSource);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: "0\n1" }]);
  });

  test("a whitespace-only cell round trips as null", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: " ", b: "0,1" })]);
    const { rows } = await roundTrip(dataSource);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: null, b: "0,1" }]);
  });
});
