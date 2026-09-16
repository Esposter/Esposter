import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("getPreciseCounts", () => {
  // A precise count of something the repo can count, written into `SCORE.md`. Every sentence on that page is a
  // Repo-wide measurement, so a number in one is always today's reading of a tree that routine work moves — and
  // Nothing fails when it drifts, which is how the page came to claim a package count and a workflow count that
  // Were each wrong by two. Magnitudes ("dozens of", "several hundred") carry the same decision value and cannot
  // Go stale, and an enumeration is its own count. The nouns are listed rather than matched as any plural,
  // Because a subset claim elsewhere ("shared by at least two packages") is a threshold, not a measurement.
  const COUNTABLE_NOUNS = [
    "components",
    "dependencies",
    "files",
    "jobs",
    "ledgers",
    "migrations",
    "packages",
    "pages",
    "routers",
    "skills",
    "stores",
    "tables",
    "tests",
    "workflows",
  ];
  const NUMBER_WORDS = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
  ];
  // The adjectives between the number and its noun are what the page reached for the last time it drifted — it
  // Claimed "three pre-release packages" over a table naming two — so a count is read through them rather than
  // Only where the two sit adjacent.
  const PRECISE_COUNT_REGEX = new RegExp(
    String.raw`(?<count>\b(?:\d+|${NUMBER_WORDS.join("|")})(?: [a-z][\w-]*){0,2} (?:${COUNTABLE_NOUNS.join("|")})\b)`,
    "giu",
  );
  // Every `<path>:<line> → <text>` where the page measures instead of stating a magnitude.
  // Nothing outside this suite calls it, so it stays here rather than in a module the build would ship for one caller.
  const getPreciseCounts = (files: { markdown: string; path: string }[]): string[] =>
    files
      .flatMap(({ markdown, path }) =>
        markdown
          .split("\n")
          .flatMap((line, index) =>
            Array.from(
              line.matchAll(PRECISE_COUNT_REGEX),
              (match) => `${path}:${index + 1} → ${match.groups?.count ?? ""}`,
            ),
          ),
      )
      .toSorted();

  const repositoryDirectory = join(import.meta.dirname, "..", "..", "..", "..");

  test.each([
    ["a digit count", "The repo has 17 packages.", "17 packages"],
    ["a word count", "Ten workflows run on every push.", "Ten workflows"],
    ["a count mid-sentence", "Split across three routers today.", "three routers"],
    ["a count reached through its adjectives", "Three pre-release packages left.", "Three pre-release packages"],
  ])("flags %s", (_label, markdown, count) => {
    expect.hasAssertions();

    expect(getPreciseCounts([{ markdown, path: "a.md" }])).toStrictEqual([`a.md:1 → ${count}`]);
  });

  test.each([
    ["a magnitude", "Dozens of tRPC routers and well over a hundred store files."],
    ["an enumeration standing in for its count", "The workflows are CI, Bench and Release."],
    ["a score", "Architecture 20 / 20."],
    ["a count of something the repo cannot count", "Retries three times before quarantining."],
  ])("leaves %s alone", (_label, markdown) => {
    expect.hasAssertions();

    expect(getPreciseCounts([{ markdown, path: "a.md" }])).toStrictEqual([]);
  });

  test("reports the line the count is on", () => {
    expect.hasAssertions();

    expect(getPreciseCounts([{ markdown: "intro\n\n17 packages", path: "a.md" }])).toStrictEqual([
      "a.md:3 → 17 packages",
    ]);
  });

  // Why the check exists: nothing else fails when the score page's measurements drift from the tree they measure
  test("the score page states none", async () => {
    expect.hasAssertions();

    const path = "SCORE.md";
    const markdown = await readFile(join(repositoryDirectory, path), "utf8");

    expect(getPreciseCounts([{ markdown, path }])).toStrictEqual([]);
  });
});
