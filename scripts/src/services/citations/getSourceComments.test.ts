import { getSourceComments } from "#src/services/citations/getSourceComments";
import { describe, expect, test } from "vitest";

describe(getSourceComments, () => {
  const NAME = "fooBar";

  // The parser's spans count bytes, so a comment after a multi-byte character is cut at its own bytes rather than at a
  // Character's offset, which would leave the name standing in the code
  test("blanks a comment that follows a multi-byte character, and reads its body", () => {
    expect.hasAssertions();

    const { code, comments } = getSourceComments("a.ts", `const s = "é😀"; // \`${NAME}\``);

    expect(code).not.toContain(NAME);
    expect(comments).toStrictEqual([` \`${NAME}\``]);
  });

  test.each([
    ["a script", `<script setup lang="ts">\n// \`${NAME}\`\n</script>`],
    ["an upper-case script", `<SCRIPT setup lang="ts">\n// \`${NAME}\`\n</SCRIPT >`],
    ["the template", `<template><!-- \`${NAME}\` --></template>`],
    ["a style", `<style>/* \`${NAME}\` */</style>`],
  ])("blanks a comment in %s of a component and reads it", (_zone, text) => {
    expect.hasAssertions();

    const { code, comments } = getSourceComments("a.vue", text);

    expect(code).not.toContain(NAME);
    expect(comments.join("\n")).toContain(NAME);
  });

  // A hash opens a comment only after a space, so the `#` of `a#b` is code
  test("reads a hash comment, and leaves a `#` inside a word as code", () => {
    expect.hasAssertions();

    const { code, comments } = getSourceComments("a.yaml", `x: a#b # \`${NAME}\``);

    expect(code).toContain("a#b");
    expect(comments).toStrictEqual([` \`${NAME}\``]);
  });
});
