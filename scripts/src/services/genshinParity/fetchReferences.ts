import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { readWikiFile } from "@esposter/genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "@esposter/genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Every reference not yet held, saved as PNG whatever the wiki serves it as (it answers images in WebP), so each
// Reads the same everywhere after; one line a reference, the path or why it is missing
export const fetchReferences = async (): Promise<void> => {
  await mkdir(REFERENCES_DIRECTORY, { recursive: true });
  const missing = Object.entries(ParityReferenceMap).filter(
    ([id]) => !existsSync(join(REFERENCES_DIRECTORY, `${id}.png`)),
  );
  const urls = await readWikiFileUrls(missing.map(([, { wikiTitle }]) => wikiTitle));
  const lines = await Promise.all(
    missing.map(async ([id, { wikiTitle }]) => {
      const url = urls.get(wikiTitle);
      const file = url ? await readWikiFile(url) : undefined;
      if (!file) return `${id}: not on the wiki as ${wikiTitle}`;
      const path = join(REFERENCES_DIRECTORY, `${id}.png`);
      await sharp(file).png().toFile(path);
      return path;
    }),
  );
  for (const line of lines) console.log(line);
};
