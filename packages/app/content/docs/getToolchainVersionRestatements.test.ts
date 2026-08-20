import { AGENT_DIRECTORY } from "@esposter/configuration";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("getToolchainVersionRestatements", () => {
  // A node or pnpm version written into prose. `engines.node` and `packageManager` in the root package.json are the
  // Declaration, and `update:node` rewrites them where they are declared — prose is not one of those places, so a
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
            [...line.matchAll(TOOLCHAIN_VERSION_REGEX)].map(
              (match) => `${path}:${index + 1} → ${match.groups?.restatement ?? ""}`,
            ),
          ),
      )
      .toSorted();

  // The hand-written markdown of the repo: the root set, the agent tree, one README per package, the docs site
  // And the skills. Generated markdown (CHANGELOG, the TypeDoc output under `public/`) is nobody's to edit, and
  // `CLAUDE.md`/`GEMINI.md` are symlinks to `AGENTS.md`.
  const ROOT_PAGES = ["AGENTS.md", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "README.md", "SCORE.md", "SECURITY.md"];
  const repositoryDirectory = join(import.meta.dirname, "..", "..", "..", "..");
  const globPaths = async (pattern: string) =>
    (await Array.fromAsync(glob(pattern, { cwd: repositoryDirectory }))).map((path) => path.replaceAll("\\", "/"));

  test.each([
    ["a caret range", "Install Node.js `^1.0.0` before anything else."],
    ["a caret major behind a link", "Install [pnpm](https://pnpm.io) `^1`."],
    ["a bare version", "This needs pnpm 1.0.0."],
    ["a v-prefixed version", "Built against node v1.0.0."],
    ["a comparison range", "Requires nodejs >=1.0.0."],
  ])("flags %s", (_label, markdown) => {
    expect.hasAssertions();

    expect(getToolchainVersionRestatements([{ markdown, path: "a.md" }])).toStrictEqual([
      expect.stringContaining("a.md:1 → "),
    ]);
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

    const paths = [
      ...ROOT_PAGES,
      ...(await globPaths(`${AGENT_DIRECTORY}/*.md`)),
      ...(await globPaths(`${AGENT_DIRECTORY}/skills/**/*.md`)),
      ...(await globPaths("packages/*/README.md")),
      ...(await globPaths("packages/app/content/docs/**/*.md")),
    ];
    const files = await Promise.all(
      paths.map(async (path) => ({ markdown: await readFile(join(repositoryDirectory, path), "utf8"), path })),
    );

    expect(getToolchainVersionRestatements(files)).toStrictEqual([]);
  });
});
