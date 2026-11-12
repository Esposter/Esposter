// @vitest-environment happy-dom
// The round trip reads the written document back with DOMParser, which only a DOM environment supplies
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { XML_MIME_TYPE, XML_SETTINGS } from "@/services/resource/sheet/xml/constants.test";
import { createXmlFile } from "@/services/resource/sheet/xml/createXmlFile.test";
import { deserializeXml } from "@/services/resource/sheet/xml/deserializeXml";
import { serializeXml } from "@/services/resource/sheet/xml/serializeXml";
import { describe, expect, test } from "vitest";

const roundTrip = async (dataSource: DataSource) => {
  const blob = await serializeXml(dataSource, XML_SETTINGS, XML_MIME_TYPE);
  return deserializeXml(createXmlFile(blob), XML_SETTINGS);
};

describe(serializeXml, () => {
  test("export and import round trip", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a b")], [createRow({ "a b": "&<" })]);
    const { columns, rows } = await roundTrip(dataSource);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a b"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ "a b": "&<" }]);
  });

  test("control characters XML cannot hold are dropped and a carriage return survives the round trip", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "x\u0001y\r\nz" })]);
    const { rows } = await roundTrip(dataSource);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: "xy\r\nz" }]);
  });

  test("the two noncharacters ending the plane are dropped, so the export imports back", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "x￿y￾z" })]);
    const { rows } = await roundTrip(dataSource);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: "xyz" }]);
  });

  test("a tab or a newline in a column name that is not a valid XML name survives the round trip", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a\tb\nc")], [createRow({ "a\tb\nc": "x" })]);
    const { columns, rows } = await roundTrip(dataSource);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a\tb\nc"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ "a\tb\nc": "x" }]);
  });

  test("a column name that is not a valid XML name is written as a cell name", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("a"), createColumn('"b" & c')],
      [createRow({ '"b" & c': 1, a: 0 })],
    );
    const blob = await serializeXml(dataSource, XML_SETTINGS, XML_MIME_TYPE);

    await expect(blob.text()).resolves.toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n<row><a>0</a><cell name="&quot;b&quot; &amp; c">1</cell></row>\n</rows>',
    );
  });
});
