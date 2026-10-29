import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getPath } from "#src/services/genshinParity/shared/getPath";
import { MAX_WIKI_TITLES_PER_QUERY, WIKI_FILE_CONCURRENCY } from "#src/services/shared/constants";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { chunk } from "@esposter/shared";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";

// Each wiki title (`File:…`) as its copy in the references, fetched once and kept as the wiki serves it, so a GIF or a
// Video keeps its frames. The titles not yet held are asked of the API in batches as it takes them; a title the wiki
// Does not hold, or a file its host does not serve, has no entry
export const resolveWikiFiles = async (titles: readonly string[]): Promise<Map<string, string>> => {
  const missingTitles = new Set(titles.filter((title) => !existsSync(getPath(title))));
  const heldPaths = new Map(
    titles.flatMap((title) => (missingTitles.has(title) ? [] : [[title, getPath(title)] as const])),
  );
  const urlMaps = await Promise.all(
    chunk([...missingTitles], MAX_WIKI_TITLES_PER_QUERY).map((batch) => readWikiFileUrls(batch)),
  );
  await mkdir(REFERENCE_SCRATCH_DIRECTORY, { recursive: true });
  await forEachConcurrently(
    urlMaps.flatMap((urlMap) => urlMap.entries().toArray()),
    WIKI_FILE_CONCURRENCY,
    async ([title, url]) => {
      const file = await readWikiFile(url);
      if (!file) return;
      await writeFile(getPath(title), file);
      heldPaths.set(title, getPath(title));
    },
  );
  return heldPaths;
};
