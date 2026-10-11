import { Builder } from "#src/Builder";
import { describe, expect, test } from "vitest";

describe(Builder, () => {
  const xmlDeclaration = '<?xml version="1.0" encoding="utf8" standalone="yes"?>';
  const builder = new Builder({ renderOpts: { pretty: false } });

  test("renders nullish values as empty elements", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ a: { b: [null, undefined], c: null, d: undefined } })).toBe(
      `${xmlDeclaration}<a><b/><b/><c/><d/></a>`,
    );
  });

  test("renders scalar values as element text", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ a: { b: ["a", "b"], c: true, d: 0, e: "a" } })).toBe(
      `${xmlDeclaration}<a><b>a</b><b>b</b><c>true</c><d>0</d><e>a</e></a>`,
    );
  });

  test("renders every entry of a root array", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ a: [{ b: 0, c: 1 }, { b: 2 }] })).toBe(
      `${xmlDeclaration}<a><b>0</b><c>1</c><b>2</b></a>`,
    );
  });

  // Issue #630: an array has no key to name the root by, so it is rendered under the root name rather than index 0
  test("renders an array root under the root name", () => {
    expect.hasAssertions();

    expect(builder.buildObject([{ b: 1 }])).toBe(`${xmlDeclaration}<root><b>1</b></root>`);
  });

  test("renders nothing for a nullish root array member or attribute bag", () => {
    expect.hasAssertions();

    expect(builder.buildObject({ a: [{ b: 0 }, null, undefined] })).toBe(`${xmlDeclaration}<a><b>0</b></a>`);
    expect(builder.buildObject({ a: { $: null, b: 0 } })).toBe(`${xmlDeclaration}<a><b>0</b></a>`);
  });

  // Issues #130 and #600: a headless document has no XML declaration, as the upstream headless option gave it
  test("omits the XML declaration when headless is set", () => {
    expect.hasAssertions();

    const headlessBuilder = new Builder({ headless: true, renderOpts: { pretty: false } });

    expect(headlessBuilder.buildObject({ a: { b: 0 } })).toBe("<a><b>0</b></a>");
  });

  // Issues #321 and #218: cdata is forced on every scalar, so a field the caller marks is wrapped whatever its value
  test("wraps every scalar value in cdata", () => {
    expect.hasAssertions();

    const cdataBuilder = new Builder({ cdata: true, renderOpts: { pretty: false } });

    expect(cdataBuilder.buildObject({ a: { b: ["a", 0, false], c: true, d: 0, e: "a" } })).toBe(
      `${xmlDeclaration}<a><b><![CDATA[a]]></b><b><![CDATA[0]]></b><b><![CDATA[false]]></b><c><![CDATA[true]]></c><d><![CDATA[0]]></d><e><![CDATA[a]]></e></a>`,
    );
  });
});
