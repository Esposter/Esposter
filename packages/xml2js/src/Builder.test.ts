import { Builder } from "#src/Builder";
import { describe, expect, test } from "vitest";

describe(Builder, () => {
  const xmlDeclaration = '<?xml version="1.0" encoding="utf8" standalone="yes"?>';
  const builder = new Builder({ renderOpts: { pretty: false } });

  test("renders nullish values as empty elements", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ root: { array: [null, undefined], object: null, value: undefined } })).toBe(
      `${xmlDeclaration}<root><array/><array/><object/><value/></root>`,
    );
  });

  test("renders scalar values as element text", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ root: { array: ["a", "b"], boolean: true, number: 1, string: "a" } })).toBe(
      `${xmlDeclaration}<root><array>a</array><array>b</array><boolean>true</boolean><number>1</number><string>a</string></root>`,
    );
  });

  test("renders every entry of a root array", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ root: [{ item: 1, other: 2 }, { item: 3 }] })).toBe(
      `${xmlDeclaration}<root><item>1</item><other>2</other><item>3</item></root>`,
    );
  });

  test("renders nothing for a nullish root array member or attribute bag", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ root: [{ item: 1 }, null, undefined] })).toBe(
      `${xmlDeclaration}<root><item>1</item></root>`,
    );
    expect(builder.buildObject({ root: { $: null, item: 1 } })).toBe(`${xmlDeclaration}<root><item>1</item></root>`);
  });

  test("wraps every scalar value in cdata", () => {
    expect.hasAssertions();

    const cdataBuilder = new Builder({ cdata: true, renderOpts: { pretty: false } });

    expect(cdataBuilder.buildObject({ root: { array: ["a", 2, false], boolean: true, number: 1, string: "a" } })).toBe(
      `${xmlDeclaration}<root><array><![CDATA[a]]></array><array><![CDATA[2]]></array><array><![CDATA[false]]></array><boolean><![CDATA[true]]></boolean><number><![CDATA[1]]></number><string><![CDATA[a]]></string></root>`,
    );
  });
});
