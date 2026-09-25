import { readHandWrittenPages } from "@@/content/docs/readHandWrittenPages.test";
import { describe, expect, test } from "vitest";

describe("getToolchainVersionRestatements", () => {
  // A node or pnpm version written into prose. `.node-version` and `packageManager` in the root package.json are the
  // Declarations, and `update:node` rewrites them where they are declared — prose is not one of those places, so a
  // Copy goes stale in silence and then tells a contributor to install the wrong runtime.
  // The name and the version sit adjacent, separated only by what wraps a version mid-sentence — a backtick, bold
  // Stars, a bracket. The one thing allowed between them is the name's own link target, since a prerequisite list
  // Links the tool it is pinning.
  const TOOLCHAIN_VERSION_REGEX =
    /(?<restatement>(?:node(?:\.?js)?|pnpm)(?:\]\([^)\s]*\))?[ `*(’']{0,3}(?:v|>=?)?(?:\^\d+(?:\.\d+)*|~\d+(?:\.\d+)*|\d+(?:\.\d+)+))/giu;
  // Every `<path>:<line> → <text>` where a page states a version instead of naming the field that declares it.
  // Nothing outside this suite calls it, so it stays here rather than in a module the build would ship for one caller.
  const getToolchainVersionRestatements = (files: { markdown: string; path: string }[]): string[] =>
    files
      .flatMap(({ markdown, path }) =>
        markdown
          .split("\n")
          .flatMap((line, index) =>
            Array.from(
              line.matchAll(TOOLCHAIN_VERSION_REGEX),
              (match) => `${path}:${index + 1} → ${match.groups?.restatement ?? ""}`,
            ),
          ),
      )
      .toSorted();

  test.each([
    ["a caret range", "Install Node.js `^1.0.0` before anything else.", "Node.js `^1.0.0"],
    ["a caret major behind a link", "Install [pnpm](https://pnpm.io) `^1`.", "pnpm](https://pnpm.io) `^1"],
    ["a bare version", "This needs pnpm 1.0.0.", "pnpm 1.0.0"],
    ["a v-prefixed version", "Built against node v1.0.0.", "node v1.0.0"],
    ["a comparison range", "Requires nodejs >=1.0.0.", "nodejs >=1.0.0"],
  ])("flags %s", (_label, markdown, restatement) => {
    expect.hasAssertions();

    expect(getToolchainVersionRestatements([{ markdown, path: "a.md" }])).toStrictEqual([`a.md:1 → ${restatement}`]);
  });

  test.each([
    ["a manifest field named rather than copied", "Install Node.js at the version `engines.node` asks for."],
    ["an issue reference that only looks like one", "Tracked upstream as nodejs/node#1."],
    ["an unrelated version", "Runs on Vuetify 4."],
  ])("leaves %s alone", (_label, markdown) => {
    expect.hasAssertions();

    expect(getToolchainVersionRestatements([{ markdown, path: "a.md" }])).toStrictEqual([]);
  });

  test("reports the line the restatement is on", () => {
    expect.hasAssertions();

    expect(getToolchainVersionRestatements([{ markdown: "intro\n\npnpm 1.0.0", path: "a.md" }])).toStrictEqual([
      "a.md:3 → pnpm 1.0.0",
    ]);
  });

  // Why the check exists: nothing else fails when a version in prose drifts from the manifest that declares it
  test("no hand-written page in the repository states one", async () => {
    expect.hasAssertions();

    const files = await readHandWrittenPages();

    expect(getToolchainVersionRestatements(files)).toStrictEqual([]);
  });
});
