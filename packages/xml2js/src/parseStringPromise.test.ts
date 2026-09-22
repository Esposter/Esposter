import { BUILTIN_NAME_KEY, TEXT_NODE_NAME } from "#src/constants";
import { parseStringPromise } from "#src/parseStringPromise";
import { describe, expect, test } from "vitest";

describe(parseStringPromise, () => {
  // The first repeated child promotes the lone value to an array, and the value that caused the promotion has to
  // Land in it — every sibling after the first is what `explicitArray: false` collects
  test("keeps every repeated child when explicitArray is off", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise<{ root: { child: string[] } }>(
      "<root><child>a</child><child>b</child><child>c</child></root>",
      { explicitArray: false },
    );

    expect(result.root.child).toStrictEqual(["a", "b", "c"]);
  });

  test("collapses whitespace runs in every text child when normalize is set", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise<{ root: { $$: { $$: Record<string, string>[] }[] } }>(
      "<root><child>a   b</child><child>c   d</child></root>",
      { charsAsChildren: true, explicitChildren: true, normalize: true, preserveChildrenOrder: true },
    );

    expect(result.root.$$.map(({ $$ }) => $$)).toStrictEqual([
      [{ _: "a b", [BUILTIN_NAME_KEY]: TEXT_NODE_NAME }],
      [{ _: "c d", [BUILTIN_NAME_KEY]: TEXT_NODE_NAME }],
    ]);
  });

  test.each([
    { expected: "  a   b  ", options: {} },
    { expected: "a   b", options: { trim: true } },
    { expected: "a b", options: { normalize: true } },
    { expected: "a b", options: { normalize: true, trim: true } },
  ])("resolves the char key to $expected with $options", async ({ expected, options }) => {
    expect.hasAssertions();

    const result = await parseStringPromise<{ root: { child: string[] } }>(
      "<root><child>  a   b  </child></root>",
      options,
    );

    expect(result.root.child).toStrictEqual([expected]);
  });

  test("applies a value processor to the normalized text, not the raw text", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise<{ root: { child: string[] } }>("<root><child>  a   b  </child></root>", {
      normalize: true,
      valueProcessors: [(value) => value.toUpperCase()],
    });

    expect(result.root.child).toStrictEqual(["A B"]);
  });

  test("merges attributes onto the node when mergeAttrs is set", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise('<root><child attr="a"/></root>', { mergeAttrs: true });

    expect(result).toStrictEqual({ root: { child: [{ attr: ["a"] }] } });
  });

  test("drops attributes when ignoreAttrs is set", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise('<root><child attr="a">a</child></root>', { ignoreAttrs: true });

    expect(result).toStrictEqual({ root: { child: ["a"] } });
  });

  test("applies the attribute name and value processors", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise('<root><child attr="a"/></root>', {
      attrNameProcessors: [(name) => name.toUpperCase()],
      attrValueProcessors: [(value) => value.toUpperCase()],
    });

    expect(result).toStrictEqual({ root: { child: [{ $: { ATTR: "A" } }] } });
  });

  test("processes the value a qualified attribute wraps when xmlns is set", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise('<root xmlns:ns="urn:x"><ns:child ns:attr="a"/></root>', {
      attrValueProcessors: [(value) => value.toUpperCase()],
      xmlns: true,
    });

    expect(result).toStrictEqual({
      root: {
        $: { "xmlns:ns": "URN:X" },
        $ns: { local: "root", uri: "" },
        "ns:child": [{ $: { "ns:attr": "A" }, $ns: { local: "child", uri: "urn:x" } }],
      },
    });
  });

  test("drops a blank char key", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise('<root><child attr="a">   </child></root>');

    expect(result).toStrictEqual({ root: { child: [{ $: { attr: "a" } }] } });
  });
});
