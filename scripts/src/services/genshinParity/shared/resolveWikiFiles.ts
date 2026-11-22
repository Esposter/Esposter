import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getPath } from "#src/services/genshinParity/shared/getPath";
import { writeWikiFiles } from "#src/services/genshinParity/shared/writeWikiFiles";
import { MAX_WIKI_TITLES_PER_QUERY } from "#src/services/shared/constants";
import { chunk } from "@esposter/shared";
import { readWikiFileUrls } from "genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";

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
  const entries = urlMaps.flatMap((urlMap) => urlMap.entries().toArray());
  const held = await writeWikiFiles(entries.map(([title, url]) => ({ path: getPath(title), url })));
  for (const [index, [title]] of entries.entries()) if (held[index]) heldPaths.set(title, getPath(title));
  return heldPaths;
};
