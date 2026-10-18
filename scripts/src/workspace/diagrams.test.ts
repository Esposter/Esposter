import { readHandWrittenPages } from "#src/workspace/readHandWrittenPages.test";
import { describe, expect, test } from "vitest";

const pages = await readHandWrittenPages();

// Every hand-written page's diagrams, which GitHub alone draws: the mistakes below parse cleanly and still draw wrong,
// So nothing but a reader looking at the rendered page would see them
describe("diagrams", () => {
  const MERMAID_REGEX = /```mermaid\r?\n(?<code>[\s\S]*?)```/gu;
  const ESCAPED_LINE_BREAK_REGEX = /\\n/u;
  const QUOTE_REGEX = /"/gu;
  const LABEL_REGEX = /"(?<label>[^"]*)"/gu;
  // A label is a name plus at most one qualifier. Past these it is a catalog entry or the paragraph the page
  // Owes, and both belong outside the box (`openspec` skill, `references/diagrams.md`)
  const MAX_LABEL_LENGTH = 90;
  const MAX_LABEL_LINE_BREAKS = 2;
  const diagrams = pages.flatMap(({ markdown, path: page }) =>
    Array.from(markdown.matchAll(MERMAID_REGEX), (match, index) => ({
      code: match.groups?.code ?? "",
      ordinal: index + 1,
      page,
    })),
  );

  // A line break inside a label is `<br/>`. A literal backslash-n draws the two characters into the box
  test("no diagram writes a line break as an escape sequence", () => {
    expect.hasAssertions();

    const offenders = diagrams
      .filter(({ code }) => ESCAPED_LINE_BREAK_REGEX.test(code))
      .map(({ ordinal, page }) => `${page} diagram ${ordinal}`);

    expect(offenders).toStrictEqual([]);
  });

  // The other half of the same mistake: a label carried across a real newline swallows it and draws as one run-on
  // Line. A quote left open at the end of a line is the only tell
  test("no diagram carries a label across a line break", () => {
    expect.hasAssertions();

    const offenders = diagrams
      .filter(({ code }) => code.split("\n").some((line) => (line.match(QUOTE_REGEX)?.length ?? 0) % 2 === 1))
      .map(({ ordinal, page }) => `${page} diagram ${ordinal}`);

    expect(offenders).toStrictEqual([]);
  });

  // The only half of "a diagram carries a mechanism" a pattern can see. What it cannot — a diagram that is a
  // Catalog, an inventory or a straight line — stays a reading pass, tracked by the docs ledger
  test("no diagram label outgrows a name and one qualifier", () => {
    expect.hasAssertions();

    const offenders = diagrams.flatMap(({ code, ordinal, page }) =>
      Array.from(code.matchAll(LABEL_REGEX), ({ groups }) => groups?.label ?? "")
        .filter((label) => label.length > MAX_LABEL_LENGTH || label.split("<br/>").length > MAX_LABEL_LINE_BREAKS + 1)
        .map((label) => `${page} diagram ${ordinal}: ${label}`),
    );

    expect(offenders).toStrictEqual([]);
  });
});
