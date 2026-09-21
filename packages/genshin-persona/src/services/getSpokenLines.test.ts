import { getSpokenLines } from "#src/services/getSpokenLines";
import { describe, expect, test } from "vitest";

describe(getSpokenLines, () => {
  const line = "a";

  test.each([
    ["a blockquote line, its prefix dropped", `> ${line}`, [line]],
    ["a prefix with no space after it", `>${line}`, [line]],
    ["a plain line", line, []],
    ["two blockquote lines among plain ones, in order", `${line}\n> ${line}\n\n> b\n${line}`, [line, "b"]],
    ["inline code, a link and emphasis", `> **[\`${line}\`](b)**`, [line]],
    ["a blockquote inside a fenced block", `\`\`\`\n> ${line}\n\`\`\``, []],
    ["a blockquote after a fence the piece never closed", `\`\`\`\n> ${line}`, []],
    ["a line with no Latin letter", "> あ", []],
    ["a line in another script with one Latin word in it", `> ${line}あ`, []],
  ])("%s: reads %s", (_case, markdown, expected) => {
    expect.hasAssertions();

    expect(getSpokenLines(markdown)).toStrictEqual(expected);
  });
});
