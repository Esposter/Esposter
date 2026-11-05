import { getLineMatches } from "#src/services/workspace/getLineMatches";
import { readHandWrittenPages } from "#src/services/workspace/readHandWrittenPages";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

describe("dataRootCommands", () => {
  // A command is one a page writes inline or in a fence, starting with the tool that runs it. The shell does not expand
  // `{data-root}`, so a command copied as written writes into a folder literally named that
  const DATA_ROOT_COMMAND_REGEX = /(?:^\s*(?:\$ )?|`)(?<command>(?:pnpm|node|vpx|npx|git) [^`]*\{data-root\}[^`]*)/gu;
  const getDataRootCommands = (files: { markdown: string; path: string }[]): string[] =>
    getLineMatches(files, DATA_ROOT_COMMAND_REGEX, "command");

  test.each([
    ["an inline command", "Run `pnpm test {data-root}/captures`.", "pnpm test {data-root}/captures"],
    ["a fenced command", "pnpm test {data-root}/captures", "pnpm test {data-root}/captures"],
    ["a command behind a prompt", "$ git -C {data-root}/repo status", "git -C {data-root}/repo status"],
  ])("flags %s", (_label, markdown, command) => {
    expect.hasAssertions();

    expect(getDataRootCommands([{ markdown, path: "a.md" }])).toStrictEqual([`a.md:1 → ${command}`]);
  });

  test.each([
    ["a placeholder in a path", "Write the cache to `{data-root}/cache`."],
    ["a command without the placeholder", "Run `pnpm test` first."],
  ])("leaves %s alone", (_label, markdown) => {
    expect.hasAssertions();

    expect(getDataRootCommands([{ markdown, path: "a.md" }])).toStrictEqual([]);
  });

  // Why the check exists: a command copied out of a page runs as written, so its placeholder names a literal folder.
  // The tool then writes there, not into the folder it defaults to
  test(
    "no page writes a command with the {data-root} placeholder in it, which the shell does not expand",
    { timeout: TREE_READ_TIMEOUT_MS },
    async () => {
      expect.hasAssertions();

      const files = await readHandWrittenPages();

      expect(getDataRootCommands(files)).toStrictEqual([]);
    },
  );
});
