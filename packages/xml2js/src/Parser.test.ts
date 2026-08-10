import { BUILTIN_NAME_KEY, TEXT_NODE_NAME } from "@/constants";
import { parseStringPromise } from "@/Parser";
import { describe, expect, test } from "vitest";

describe(parseStringPromise, () => {
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

  test("drops a blank char key", async () => {
    expect.hasAssertions();

    const result = await parseStringPromise('<root><child attr="value">   </child></root>');

    expect(result).toStrictEqual({ root: { child: [{ $: { attr: "value" } }] } });
  });
});
