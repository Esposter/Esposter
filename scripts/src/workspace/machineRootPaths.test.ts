import { getLineMatches } from "#src/services/workspace/getLineMatches";
import { readHandWrittenPages } from "#src/services/workspace/readHandWrittenPages";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

describe("getMachineRootPaths", () => {
  // A path into one person's home folder, which goes stale on the next machine and on the next rename: a `~/` followed
  // By a name, or an absolute user folder with its name spelled out. The root is written as its placeholder instead
  // (`repo-owned-facts`, "Machine roots"). A `<placeholder>` is not a name, and `~~/` is Nuxt's own import alias
  const MACHINE_ROOT_REGEX = /(?<path>(?<![~\w])~\/[.\w-]+|(?:[A-Za-z]:\\Users|\/c\/Users|\/Users)[\\/][\w.-]+)/giu;
  const getMachineRootPaths = (files: { markdown: string; path: string }[]): string[] =>
    getLineMatches(files, MACHINE_ROOT_REGEX, "path");

  test.each([
    ["a home-folder path", "Store it in `~/Esposter/cache`.", "~/Esposter"],
    ["a dotted home-folder path", "The settings sit at ~/.claude/settings.json.", "~/.claude"],
    ["a Windows user folder", "Open C:\\Users\\jimmyc\\Documents first.", "C:\\Users\\jimmyc"],
    ["a Git Bash user folder", "Run it from /c/Users/jimmyc/repo.", "/c/Users/jimmyc"],
    ["a macOS user folder", "Found in /Users/jimmyc/Library.", "/Users/jimmyc"],
  ])("flags %s", (_label, markdown, path) => {
    expect.hasAssertions();

    expect(getMachineRootPaths([{ markdown, path: "a.md" }])).toStrictEqual([`a.md:1 → ${path}`]);
  });

  test.each([
    ["a placeholder for the root", "Name the root `{data-root}`, then write `{data-root}/cache`."],
    ["a placeholder for the user", "Open `C:\\Users\\<user>\\` first."],
    ["the Nuxt import alias", "Import the router from `~~/server/trpc/router`."],
    ["a repository path from the root", "Keys live in `packages/genshin-world/src/data`."],
    ["a source folder named home", "The screen is `apps/web/app/components/home/layout`."],
  ])("leaves %s alone", (_label, markdown) => {
    expect.hasAssertions();

    expect(getMachineRootPaths([{ markdown, path: "a.md" }])).toStrictEqual([]);
  });

  test("reports the line the path is on", () => {
    expect.hasAssertions();

    expect(getMachineRootPaths([{ markdown: "intro\n\n~/Esposter/cache", path: "a.md" }])).toStrictEqual([
      "a.md:3 → ~/Esposter",
    ]);
  });

  // Why the check exists: a path into a home folder is true on one machine and stale on every other, and a rename of
  // The project leaves it pointing at a folder that no longer exists
  test("no hand-written page in the repository names one", { timeout: TREE_READ_TIMEOUT_MS }, async () => {
    expect.hasAssertions();

    const files = await readHandWrittenPages();

    expect(getMachineRootPaths(files)).toStrictEqual([]);
  });
});
