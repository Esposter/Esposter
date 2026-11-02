import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const STYLE_BLOCK_REGEX = /<style[^>]*>(?<css>[\s\S]*?)<\/style>/gu;

// Every stylesheet of the two Genshin packages that draw the game's controls, a `.vue` file's style blocks and each
// `.css` file, with the line each starts on. Git's pathspec `*` crosses directories, so one per extension and package
// Covers the whole tree
export const readGenshinStyleBlocks = (): { css: string; firstLine: number; path: string }[] =>
  readSweepFilePaths(
    "packages/genshin-interface/src/*.vue",
    "packages/genshin-interface/src/*.css",
    "packages/genshin-world/src/*.vue",
    "packages/genshin-world/src/*.css",
  ).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
    if (path.endsWith(".css")) return [{ css: contents, firstLine: 1, path }];
    return Array.from(contents.matchAll(STYLE_BLOCK_REGEX), ({ groups: { css = "" } = {}, index }) => ({
      css,
      firstLine: contents.slice(0, index + contents.slice(index).indexOf(">") + 1).split("\n").length,
      path,
    }));
  });
