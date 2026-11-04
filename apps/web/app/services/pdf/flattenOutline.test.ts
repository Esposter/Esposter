// @vitest-environment happy-dom
import type { PdfOutline } from "vue-pdfjs-headless";

import { flattenOutline } from "@/services/pdf/flattenOutline";
import { describe, expect, test } from "vitest";

const createNode = (title: string, items: PdfOutline = []): PdfOutline[number] => ({
  bold: false,
  color: new Uint8ClampedArray(),
  count: undefined,
  dest: title,
  italic: false,
  items,
  newWindow: undefined,
  title,
  unsafeUrl: undefined,
  url: null,
});

describe(flattenOutline, () => {
  test("a nested entry follows its parent one level deeper", () => {
    expect.hasAssertions();

    const outline = [createNode("Chapter 1", [createNode("Section 1.1")]), createNode("Chapter 2")];

    expect(flattenOutline(outline).map(({ depth, item, key }) => [key, depth, item.title])).toStrictEqual([
      ["0", 0, "Chapter 1"],
      ["0.0", 1, "Section 1.1"],
      ["1", 0, "Chapter 2"],
    ]);
  });

  test("keys stay unique across depths and indexes past ten", () => {
    expect.hasAssertions();

    const tenth = Array.from({ length: 10 }, (_value, index) => createNode(`Entry ${index}`));
    const outline = [createNode("Parent", [createNode("Child")]), ...tenth];
    const keys = flattenOutline(outline).map(({ key }) => key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("10");
  });
});
