import { WIKI_FILE_CONCURRENCY } from "#src/services/shared/constants";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";

// Each file written to its path as the wiki's file host serves it, with at most WIKI_FILE_CONCURRENCY reads in flight, so
// Every caller shares that bound. A path already on disk is kept as it is. Answered in the order the files are given: true
// Where the path now holds its file, false for a file the host does not serve, which is not written
export const writeWikiFiles = async (files: readonly { path: string; url: string }[]): Promise<boolean[]> => {
  const held = files.map(() => false);
  await forEachConcurrently(files.entries(), WIKI_FILE_CONCURRENCY, async ([index, { path, url }]) => {
    if (existsSync(path)) {
      held[index] = true;
      return;
    }
    const file = await readWikiFile(url);
    if (file === undefined) return;
    await writeFile(path, file);
    held[index] = true;
  });
  return held;
};
