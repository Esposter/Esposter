import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { PRINT_WIDTH } from "@esposter/configuration/oxfmt";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The template half of `comments/no-over-width-comment`: oxlint reads only a component's script, and vize's tree carries
// No comment, so an HTML comment in a template is measured here against the width the formatter sets. As the rule
// Measures a block comment, every line the comment covers counts, and a line with code beside the comment does not
const findOverWidthCommentLines = (text: string): number[] => {
  const lines = text.split("\n");
  const lineOffsets: number[] = [];
  lines.reduce((offset, line) => {
    lineOffsets.push(offset);
    return offset + line.length + 1;
  }, 0);
  const lineAt = (position: number): number => lineOffsets.findLastIndex((offset) => offset <= position);
  return [...text.matchAll(/<!--[\s\S]*?-->/gu)].flatMap((comment) => {
    const start = comment.index;
    const end = start + comment[0].length;
    const firstLine = lineAt(start);
    const lastLine = lineAt(end);
    return lines.slice(firstLine, lastLine + 1).flatMap((line, offset) => {
      const index = firstLine + offset;
      const before = index === firstLine ? line.slice(0, start - lineOffsets[index]) : "";
      const after = index === lastLine ? line.slice(end - lineOffsets[index]) : "";
      return line.length > PRINT_WIDTH && before.trim() === "" && after.trim() === "" ? [index + 1] : [];
    });
  });
};

describe("templateCommentWidths", () => {
  test("every template comment line fits the print width", () => {
    expect.hasAssertions();

    expect(
      getNonEmptyLines(runGit(["grep", "-l", "-F", "<!--", "--", "*.vue"])).flatMap((file) =>
        findOverWidthCommentLines(readFileSync(join(REPOSITORY_ROOT, file), "utf8")).map((line) => `${file}:${line}`),
      ),
    ).toStrictEqual([]);
  });
});
