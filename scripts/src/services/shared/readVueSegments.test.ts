import { readVueSegments } from "#src/services/shared/readVueSegments";
import { describe, expect, test } from "vitest";

describe(readVueSegments, () => {
  test("joins back to the file it read", () => {
    expect.hasAssertions();

    const text = '<script setup lang="ts">\nconst a = 1;\n</script>\n\n<template><p>{{ a }}</p></template>\n';

    expect(
      readVueSegments(text)
        .map(({ text: segment }) => segment)
        .join(""),
    ).toBe(text);
  });

  test("marks the body of a script block and no tag around it", () => {
    expect.hasAssertions();

    const segments = readVueSegments('<script lang="ts">\nconst a = 1;\n</script>\n<template><p /></template>\n');

    expect(segments.filter(({ isScript }) => isScript).map(({ text }) => text)).toStrictEqual(["\nconst a = 1;\n"]);
  });

  test("reads both blocks of a file with a plain script and a setup script, in file order", () => {
    expect.hasAssertions();

    const segments = readVueSegments(
      '<script setup lang="ts">\nconst b = 2;\n</script>\n\n<script lang="ts">\nexport const a = 1;\n</script>\n',
    );

    expect(segments.filter(({ isScript }) => isScript).map(({ text }) => text)).toStrictEqual([
      "\nconst b = 2;\n",
      "\nexport const a = 1;\n",
    ]);
  });

  test("cuts at characters when the file holds multibyte text before and inside the block", () => {
    expect.hasAssertions();

    const text = '<template><p>日本語</p></template>\n<script lang="ts">\nconst 名前 = "🎴";\n</script>\n';

    expect(readVueSegments(text).find(({ isScript }) => isScript)?.text).toBe('\nconst 名前 = "🎴";\n');
  });

  test("reads a block whose generic attribute holds a closing angle bracket and whose closing tag has a space", () => {
    expect.hasAssertions();

    const segments = readVueSegments(
      '<script setup lang="ts" generic="T extends Array<string>">\nconst a = 1;\n</script >\n',
    );

    expect(segments.find(({ isScript }) => isScript)?.text).toBe("\nconst a = 1;\n");
  });

  test("returns the whole file as markup when it has no script block", () => {
    expect.hasAssertions();

    expect(readVueSegments("<template><p /></template>\n")).toStrictEqual([
      { isScript: false, text: "<template><p /></template>\n" },
    ]);
  });

  test("throws on a script block that is never closed", () => {
    expect.hasAssertions();

    expect(() => readVueSegments("<script>\nconst a = 1;\n")).toThrowErrorMatchingInlineSnapshot(
      `[Error: Malformed <script> block: the closing tag is missing.]`,
    );
  });
});
