import { BUILTIN_NAME_KEY, TEXT_NODE_NAME } from "#src/constants";
import { parseStringPromise } from "#src/parseStringPromise";
import { describe, expect, test } from "vitest";

describe(parseStringPromise, () => {
  // The first repeated child promotes the lone value to an array, and the value that caused the promotion has to
  // Land in it — every sibling after the first is what `explicitArray: false` collects
  test("keeps every repeated child when explicitArray is off", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise<{ a: { b: string[] } }>("<a><b>a</b><b>b</b><b>c</b></a>", {
      explicitArray: false,
    });

    expect(parsedXml.a.b).toStrictEqual(["a", "b", "c"]);
  });

  test("collapses whitespace runs in every text child when normalize is set", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise<{ a: { $$: { $$: Record<string, string>[] }[] } }>(
      "<a><b>a  b</b><b>b  a</b></a>",
      { charsAsChildren: true, explicitChildren: true, normalize: true, preserveChildrenOrder: true },
    );

    expect(parsedXml.a.$$.map(({ $$ }) => $$)).toStrictEqual([
      [{ _: "a b", [BUILTIN_NAME_KEY]: TEXT_NODE_NAME }],
      [{ _: "b a", [BUILTIN_NAME_KEY]: TEXT_NODE_NAME }],
    ]);
  });

  test.each([
    { expected: " a  b ", options: {} },
    { expected: "a  b", options: { trim: true } },
    { expected: "a b", options: { normalize: true } },
    { expected: "a b", options: { normalize: true, trim: true } },
  ])("resolves the char key to $expected with $options", async ({ expected, options }) => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise<{ a: { b: string[] } }>("<a><b> a  b </b></a>", options);

    expect(parsedXml.a.b).toStrictEqual([expected]);
  });

  test("applies a value processor to the normalized text, not the raw text", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise<{ a: { b: string[] } }>("<a><b> a  b </b></a>", {
      normalize: true,
      valueProcessors: [(value) => value.toUpperCase()],
    });

    expect(parsedXml.a.b).toStrictEqual(["A B"]);
  });

  test("merges attributes onto the node when mergeAttrs is set", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise('<a><b c="a"/></a>', { mergeAttrs: true });

    expect(parsedXml).toStrictEqual({ a: { b: [{ c: ["a"] }] } });
  });

  test("drops attributes when ignoreAttrs is set", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise('<a><b c="a">a</b></a>', { ignoreAttrs: true });

    expect(parsedXml).toStrictEqual({ a: { b: ["a"] } });
  });

  test("applies the attribute name and value processors", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise('<a><b c="a"/></a>', {
      attrNameProcessors: [(name) => name.toUpperCase()],
      attrValueProcessors: [(value) => value.toUpperCase()],
    });

    expect(parsedXml).toStrictEqual({ a: { b: [{ $: { C: "A" } }] } });
  });

  test("processes the value a qualified attribute wraps when xmlns is set", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise('<a xmlns:c="a"><c:b c:d="a"/></a>', {
      attrValueProcessors: [(value) => value.toUpperCase()],
      xmlns: true,
    });

    expect(parsedXml).toStrictEqual({
      a: {
        $: { "xmlns:c": "A" },
        $ns: { local: "a", uri: "" },
        "c:b": [{ $: { "c:d": "A" }, $ns: { local: "b", uri: "a" } }],
      },
    });
  });

  test("drops a blank char key", async () => {
    expect.hasAssertions();

    const parsedXml = await parseStringPromise('<a><b c="a"> </b></a>');

    expect(parsedXml).toStrictEqual({ a: { b: [{ $: { c: "a" } }] } });
  });
});
