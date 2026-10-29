import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { TEST_RICH_TEXT } from "#src/services/constants.test";
import { readMjmlContent } from "#src/services/readMjmlContent";
import { parse } from "node-html-parser";
import { assert, describe, expect, test } from "vitest";

const readLabel = (content: string): unknown => {
  const [element] = parse(`<mj-button>${content}</mj-button>`, { blockTextElements: { "mj-button": true } }).children;
  assert(element);
  return readMjmlContent(element, MjmlContentKind.Label, TEST_RICH_TEXT);
};

describe(readMjmlContent, () => {
  test("reads a label holding an element as its html", () => {
    expect.hasAssertions();

    expect(readLabel("Buy <b>now</b>")).toStrictEqual({ html: "Buy <b>now</b>" });
  });

  test("reads a label with no closed tag as its text", () => {
    expect.hasAssertions();

    expect(readLabel("1 < 2 and <a")).toBe("1 < 2 and <a");
  });

  test("reads a long run of unclosed tags in linear time", () => {
    expect.hasAssertions();

    const start = performance.now();

    expect(readLabel("<a".repeat(30_000))).toBe("<a".repeat(30_000));
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
