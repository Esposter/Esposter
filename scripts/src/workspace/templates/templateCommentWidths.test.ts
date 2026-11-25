import { findOverWidthCommentLines } from "#src/services/oxlint/comments/findOverWidthCommentLines";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The template half of `comments/no-over-width-comment`: oxlint reads only a component's script, and vize's tree
// Carries no comment, so an HTML comment in a template is measured here against the width the formatter sets. As the
// Rule measures a block comment, every line the comment covers counts, and a line with code beside the comment does not
const findTemplateOverWidthLines = (text: string): number[] =>
  [...text.matchAll(/<!--[\s\S]*?-->/gu)].flatMap((comment) => {
    const start = comment.index;
    return findOverWidthCommentLines(
      text,
      start,
      start + comment[0].length,
      text.slice(0, start).split("\n").length,
    ).map(({ lineNumber }) => lineNumber);
  });

describe("templateCommentWidths", () => {
  test("every template comment line fits the print width", () => {
    expect.hasAssertions();

    expect(
      getNonEmptyLines(runGit(["grep", "-l", "-F", "<!--", "--", "*.vue"])).flatMap((file) =>
        findTemplateOverWidthLines(readFileSync(join(REPOSITORY_ROOT, file), "utf8")).map((line) => `${file}:${line}`),
      ),
    ).toStrictEqual([]);
  });
});
