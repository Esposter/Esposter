import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { describe, expect, test } from "vitest";

describe(getDuplicateProse, () => {
  // One word per position, so a run's length is read straight off its text
  const words = Array.from({ length: SHINGLE_SIZE + 1 }, (_, index) => `a${index}`);
  const text = words.join(" ");
  const firstPath = "a";
  const secondPath = "b";

  // The whole reason this scan exists: a scan that reports nothing reads exactly like a tree with one owner per
  // Topic, so the first thing it owes is a planted copy it does report
  test("reports a run two pages share, positioned by the first", () => {
    expect.hasAssertions();

    expect(
      getDuplicateProse([
        { path: firstPath, text },
        { path: secondPath, text: `${text} b` },
      ]),
    ).toStrictEqual([{ paths: [firstPath, secondPath], words }]);
  });

  // A shingle the second page repeats is kept at its first position there, so a pair can run on over the first
  // Page while the second jumps — and the words that run would report are ones the second page never holds in a row
  test("stops a run where the second page stops being adjacent", () => {
    expect.hasAssertions();

    const separatedText = `${words.slice(0, SHINGLE_SIZE).join(" ")} c ${words.slice(1).join(" ")}`;
    expect(
      getDuplicateProse([
        { path: firstPath, text },
        { path: secondPath, text: separatedText },
      ]),
    ).toStrictEqual([
      { paths: [firstPath, secondPath], words: words.slice(0, SHINGLE_SIZE) },
      { paths: [firstPath, secondPath], words: words.slice(1) },
    ]);
  });

  test("reports the longest run first", () => {
    expect.hasAssertions();

    const shorterText = Array.from({ length: SHINGLE_SIZE }, (_, index) => `b${index}`).join(" ");
    expect(
      getDuplicateProse([
        { path: firstPath, text: `${shorterText} c ${text}` },
        { path: secondPath, text: `${shorterText} d ${text}` },
      ]).map(({ words: runWords }) => runWords.length),
    ).toStrictEqual([SHINGLE_SIZE + 1, SHINGLE_SIZE]);
  });

  test("reports nothing for a run shorter than a shingle", () => {
    expect.hasAssertions();

    expect(
      getDuplicateProse([
        { path: firstPath, text: words.slice(2).join(" ") },
        { path: secondPath, text: words.slice(2).join(" ") },
      ]),
    ).toStrictEqual([]);
  });

  // A phrase every page of a kind opens on is its template, not a copy of one page by another
  test("reports nothing for a run three pages share", () => {
    expect.hasAssertions();

    expect(
      getDuplicateProse([
        { path: firstPath, text },
        { path: secondPath, text },
        { path: "c", text },
      ]),
    ).toStrictEqual([]);
  });

  test("reports nothing for two pages of one skill", () => {
    expect.hasAssertions();

    expect(
      getDuplicateProse([
        { path: ".agents/skills/a/SKILL.md", text },
        { path: ".agents/skills/a/references/b.md", text },
      ]),
    ).toStrictEqual([]);
  });

  test("reads past the frontmatter, the case and the punctuation", () => {
    expect.hasAssertions();

    expect(
      getDuplicateProse([
        { path: firstPath, text: `---\n${text}\n---\n${text.toUpperCase()}` },
        { path: secondPath, text: `\`${words.join("`, `")}\`` },
      ]),
    ).toStrictEqual([{ paths: [firstPath, secondPath], words }]);
  });
});
