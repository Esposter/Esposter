import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getUnguardedHovers } from "#src/services/sweeps/hoverGuard/getUnguardedHovers";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const STYLE_BLOCK_REGEX = /<style[^>]*>([\s\S]*?)<\/style>/gu;

// Every stylesheet of the two Genshin packages that draw the game's controls, a `.vue` file's style blocks and each
// `.css` file, one `path:line: selector` per hover rule outside the hover media query. Git's pathspec `*` crosses
// Directories, so one per extension and package covers the whole tree
export const readUnguardedHoverFindings = (): string[] =>
  readSweepFilePaths(
    "packages/genshin-interface/src/*.vue",
    "packages/genshin-interface/src/*.css",
    "packages/genshin-world/src/*.vue",
    "packages/genshin-world/src/*.css",
  ).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
    const blocks = path.endsWith(".css")
      ? [{ css: contents, firstLine: 1 }]
      : Array.from(contents.matchAll(STYLE_BLOCK_REGEX), ({ 1: css = "", index }) => ({
          css,
          firstLine: contents.slice(0, index + contents.slice(index).indexOf(">") + 1).split("\n").length,
        }));
    return blocks.flatMap(({ css, firstLine }) =>
      getUnguardedHovers(css, firstLine).map((finding) => `${path}:${finding}`),
    );
  });
