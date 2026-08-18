import { Builder } from "@/Builder";
import { describe, expect, test } from "vitest";

describe(Builder, () => {
  const xmlDeclaration = '<?xml version="1.0" encoding="utf8" standalone="yes"?>';

  test("renders nullish values as empty elements", () => {
    expect.hasAssertions();

    const builder = new Builder({ renderOpts: { pretty: false } });

    expect(builder.buildObject({ root: { array: [null, undefined], object: null, value: undefined } })).toBe(
      `${xmlDeclaration}<root><array/><array/><object/><value/></root>`,
    );
  });

  test("renders scalar values as element text", () => {
    expect.hasAssertions();

    const builder = new Builder({ renderOpts: { pretty: false } });

    expect(builder.buildObject({ root: { array: ["x", "y"], boolean: true, number: 1, string: "text" } })).toBe(
      `${xmlDeclaration}<root><array>x</array><array>y</array><boolean>true</boolean><number>1</number><string>text</string></root>`,
    );
  });

  test("renders every entry of a root array", () => {
    expect.hasAssertions();

    const builder = new Builder({ renderOpts: { pretty: false } });

    expect(builder.buildObject({ root: [{ item: 1, other: 2 }, { item: 3 }] })).toBe(
      `${xmlDeclaration}<root><item>1</item><other>2</other><item>3</item></root>`,
    );
  });

  test("renders nothing for a nullish root array member or attribute bag", () => {
    expect.hasAssertions();

    const builder = new Builder({ renderOpts: { pretty: false } });

    expect(builder.buildObject({ root: [{ item: 1 }, null, undefined] })).toBe(
      `${xmlDeclaration}<root><item>1</item></root>`,
    );
    expect(builder.buildObject({ root: { $: null, item: 1 } })).toBe(`${xmlDeclaration}<root><item>1</item></root>`);
  });

  test("wraps every scalar value in cdata", () => {
    expect.hasAssertions();

    const builder = new Builder({ cdata: true, renderOpts: { pretty: false } });

    expect(builder.buildObject({ root: { array: ["x", 2, false], boolean: true, number: 1, string: "text" } })).toBe(
      `${xmlDeclaration}<root><array><![CDATA[x]]></array><array><![CDATA[2]]></array><array><![CDATA[false]]></array><boolean><![CDATA[true]]></boolean><number><![CDATA[1]]></number><string><![CDATA[text]]></string></root>`,
    );
  });
});
