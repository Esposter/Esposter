// @vitest-environment happy-dom
// The codec reads the document with DOMParser, which only a DOM environment supplies
import { XML_SETTINGS } from "@/services/resource/sheet/xml/constants.test";
import { createXmlFile } from "@/services/resource/sheet/xml/createXmlFile.test";
import { deserializeXml } from "@/services/resource/sheet/xml/deserializeXml";
import { describe, expect, test } from "vitest";

describe(deserializeXml, () => {
  test("Rows and cells are read", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><a>0</a><b>1</b></row><row><a>2</a><b>3</b></row></rows>");
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "b"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([
      { a: 0, b: 1 },
      { a: 2, b: 3 },
    ]);
  });

  test("A column first seen in a later row is a column", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><a>0</a></row><row><a>2</a><b>3</b></row></rows>");
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "b"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([
      { a: 0, b: null },
      { a: 2, b: 3 },
    ]);
  });

  test("A cell named by attribute keeps its name", async () => {
    expect.hasAssertions();

    const file = createXmlFile('<rows><row><cell name="a b">0</cell></row></rows>');
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a b"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ "a b": 0 }]);
  });

  test("A row's attributes are read as cells", async () => {
    expect.hasAssertions();

    const file = createXmlFile('<rows><row id="0"><a>1</a></row></rows>');
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "id"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: 1, id: 0 }]);
  });

  test("A cell a row repeats is a column of its own", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><a>0</a><a>1</a></row></rows>");
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "a (2)"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: 0, "a (2)": 1 }]);
  });

  test("A file with one row reads that row", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><a>0</a></row></rows>");
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: 0 }]);
  });

  test("A column named parsererror is a column, not a failure to parse", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><parsererror>0</parsererror></row></rows>");
    const { columns } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["parsererror"]);
  });

  test("A column named parsererror under a default namespace is a column too", async () => {
    expect.hasAssertions();

    const file = createXmlFile('<rows xmlns="urn:example"><row><parsererror>0</parsererror></row></rows>');
    const { columns, rows } = await deserializeXml(file, XML_SETTINGS);

    expect(columns.map(({ name }) => name)).toStrictEqual(["parsererror"]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ parsererror: 0 }]);
  });

  test("A malformed document is refused", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><a>0</row></rows>");

    await expect(deserializeXml(file, XML_SETTINGS)).rejects.toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: a.xml, error on line 1 at column 22: Opening and ending tag mismatch: a line 1 and row
      ]
    `);
  });

  test("A document with a doctype is refused", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<!DOCTYPE rows><rows><row><a>0</a></row></rows>");

    await expect(deserializeXml(file, XML_SETTINGS)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a.xml, a DOCTYPE is refused, since its entities can expand a small file into a large one]`,
    );
  });

  test("A nested cell is refused", async () => {
    expect.hasAssertions();

    const file = createXmlFile("<rows><row><a><b>0</b></a></row></rows>");

    await expect(deserializeXml(file, XML_SETTINGS)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a.xml, a holds child elements, and a cell can only hold text]`,
    );
  });
});
