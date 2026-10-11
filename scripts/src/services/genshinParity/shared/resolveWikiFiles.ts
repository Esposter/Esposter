import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { MAX_WIKI_TITLES_PER_QUERY, WIKI_FILE_CONCURRENCY } from "#src/services/shared/constants";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { chunk } from "@esposter/shared";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A title's copy in the references: its spaces are its file's underscores, as the wiki names it, and a slash in it is one too
const getPath = (title: string) => join(REFERENCES_DIRECTORY, title.slice("File:".length).replaceAll(/[ /]/gu, "_"));

// Each wiki title (`File:…`) as its copy in the references, fetched once and kept as the wiki serves it, so a GIF or a
// Video keeps its frames. The titles not yet held are asked of the API in batches as it takes them; a title the wiki
// Does not hold, or a file its host does not serve, has no entry
export const resolveWikiFiles = async (titles: readonly string[]): Promise<Map<string, string>> => {
  const missingTitles = titles.filter((title) => !existsSync(getPath(title)));
  const urlMaps = await Promise.all(
    chunk(missingTitles, MAX_WIKI_TITLES_PER_QUERY).map((batch) => readWikiFileUrls(batch)),
  );
  await mkdir(REFERENCES_DIRECTORY, { recursive: true });
  await forEachConcurrently(
    urlMaps.flatMap((urlMap) => urlMap.entries().toArray()),
    WIKI_FILE_CONCURRENCY,
    async ([title, url]) => {
      const file = await readWikiFile(url);
      if (file) await writeFile(getPath(title), file);
    },
  );
  return new Map(titles.flatMap((title) => (existsSync(getPath(title)) ? [[title, getPath(title)] as const] : [])));
};
