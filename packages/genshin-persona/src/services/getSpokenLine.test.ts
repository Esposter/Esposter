import { getSpokenLine } from "#src/services/getSpokenLine";
import { describe, expect, test } from "vitest";

describe(getSpokenLine, () => {
  const line = "a";

  test.each([
    ["a blockquote line, its prefix dropped", `> ${line}`, line],
    ["a prefix with no space after it", `>${line}`, line],
    ["a plain line", line, undefined],
    ["inline code, a link and emphasis", `> **[\`${line}\`](b)**`, line],
    ["a list item, its marker dropped", `> - ${line}`, line],
    ["a numbered item, its marker dropped", `> 1. ${line}`, line],
    ["a line with no Latin letter", "> あ", undefined],
    ["a line in another script with one Latin word in it", `> ${line}あ`, undefined],
  ])("%s: reads %s", (_case, markdown, expected) => {
    expect.hasAssertions();

    expect(getSpokenLine(markdown)).toStrictEqual(expected);
  });
});
