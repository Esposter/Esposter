import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

interface VueFile {
  path: string;
  text: string;
}

const getLine = (text: string, index: number): number => text.slice(0, index).split("\n").length;

// The template rules no tool runs for us yet, each read over the components' text in place of the rule, and each going
// With the upstream marker on its constants. The tree is read once for all of them
describe("templateTextRules", () => {
  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13666 — `vize fmt` pads the blocks, so components move to it
  // And this check goes once it formats a staged copy, honours `objectWrap` and keeps multi-line CSS arguments, the
  // Gaps listed on that issue
  const UNPADDED_BLOCK_MESSAGE =
    "Put a blank line between a component's top-level blocks: this block opens straight after the previous one closes.";
  // A top-level closing tag on its own line, and the line after it starting with a tag: the lookahead leaves that tag
  // Out
  const UNPADDED_BLOCK_REGEX = /^<\/[\w-]+>\r?\n(?=<[\w-])/gmu;
  let trackedFiles: VueFile[] = [];

  // Reported on the line the block opens on
  const getUnpaddedBlocks = (files: VueFile[]): string[] =>
    files.flatMap(({ path, text }) =>
      Array.from(
        text.matchAll(UNPADDED_BLOCK_REGEX),
        (match) => `${path}:${getLine(text, match.index + match[0].length)} → ${UNPADDED_BLOCK_MESSAGE}`,
      ),
    );

  beforeAll(() => {
    trackedFiles = readSweepFilePaths("*.vue").map((path) => ({
      path,
      text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
    }));
  }, TREE_READ_TIMEOUT_MS);

  test.each([
    '<script setup lang="ts">\nconst a = 1;\n</script>\n<template>\n  <div />\n</template>\n',
    "<template>\n  <div />\n</template>\n<style scoped>\n</style>\n",
  ])("flags the unpadded blocks %j", (text) => {
    expect.hasAssertions();

    expect(getUnpaddedBlocks([{ path: "a.vue", text }])).toStrictEqual([`a.vue:4 → ${UNPADDED_BLOCK_MESSAGE}`]);
  });

  test.each([
    "</script>\n\n<template>\n",
    "<template>\n  <div>\n  </div>\n  </template>\n  <div />\n</template>\n",
    "</template>\nfreeform text\n",
  ])("leaves the blocks %j alone", (text) => {
    expect.hasAssertions();

    expect(getUnpaddedBlocks([{ path: "a.vue", text }])).toStrictEqual([]);
  });

  test("no tracked component breaks a template text rule", () => {
    expect.hasAssertions();

    expect(getUnpaddedBlocks(trackedFiles)).toStrictEqual([]);
  });
});
