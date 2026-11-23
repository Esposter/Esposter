import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { PRINT_WIDTH } from "@esposter/configuration/oxfmt";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The template half of `comments/no-over-width-comment`: oxlint reads only a component's script, and vize's tree
// Carries no comment, so an HTML comment in a template is measured here against the width the formatter sets. As the
// Rule measures a block comment, every line the comment covers counts, and a line with code beside the comment does not
const findOverWidthCommentLines = (text: string): number[] =>
  [...text.matchAll(/<!--[\s\S]*?-->/gu)].flatMap((comment) => {
    const start = comment.index;
    const end = start + comment[0].length;
    const hits: number[] = [];
    let lineNumber = text.slice(0, start).split("\n").length;
    for (let lineStart = text.lastIndexOf("\n", start - 1) + 1; lineStart <= end; lineNumber++) {
      const newline = text.indexOf("\n", lineStart);
      const lineEnd = newline === -1 ? text.length : newline;
      const before = text.slice(lineStart, Math.min(start, lineEnd));
      const after = text.slice(Math.max(end, lineStart), lineEnd);
      if (lineEnd - lineStart > PRINT_WIDTH && before.trim() === "" && after.trim() === "") hits.push(lineNumber);
      lineStart = lineEnd + 1;
    }
    return hits;
  });

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
