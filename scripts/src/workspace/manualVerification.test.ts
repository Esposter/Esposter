import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The Genshin roadmap's Manual verification list is the user's one batch, so its shape is held here
describe("manualVerification", () => {
  const ROADMAP_PATH = "openspec/changes/genshin-roadmap/tasks.md";
  const SECTION_HEADING = "Manual verification";
  const ITEM_REGEX = /^- \[[ x]\] /u;
  const PAGE_LINK_REGEX = /\]\([^)\s]+\.md(?:#[^)\s]*)?\)/u;
  // An item is a question, the page that holds its source and the one fact to judge it by, so a batch of a hundred
  // Reads at a glance; whatever is longer is the owning page's decision. A link is read by its text, so its target
  // Counts for nothing
  const MAX_QUESTION_LENGTH = 300;
  const LINK_TARGET_REGEX = /(?<=\])\([^)\s]+\)/gu;
  const section =
    readFileSync(join(REPOSITORY_ROOT, ROADMAP_PATH), "utf8")
      .split(/^## /mu)
      .find((part) => part.startsWith(SECTION_HEADING)) ?? "";
  // Everything from the first list line on is an item or a part of one; the intro paragraph above stays prose
  const lines = section.split(/\r?\n/u).filter((line) => line.trim() !== "");
  const itemLines = lines.slice(
    Math.max(
      0,
      lines.findIndex((line) => line.startsWith("-")),
    ),
  );

  test("the section holds items", () => {
    expect.hasAssertions();

    expect(itemLines.length).toBeGreaterThan(1);
  });

  test("every item is one checkbox line with no continuation", () => {
    expect.hasAssertions();

    expect(itemLines.filter((line) => !ITEM_REGEX.test(line))).toStrictEqual([]);
  });

  test("every item links a page", () => {
    expect.hasAssertions();

    expect(itemLines.filter((line) => ITEM_REGEX.test(line) && !PAGE_LINK_REGEX.test(line))).toStrictEqual([]);
  });

  test(`every item is under ${MAX_QUESTION_LENGTH} characters`, () => {
    expect.hasAssertions();

    expect(
      itemLines.filter((line) => line.replaceAll(LINK_TARGET_REGEX, "").length >= MAX_QUESTION_LENGTH),
    ).toStrictEqual([]);
  });
});
