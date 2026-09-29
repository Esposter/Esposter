import { CAPTURES_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { runFfmpeg } from "#src/services/genshinParity/runFfmpeg";
import { readWikiFile } from "@esposter/genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "@esposter/genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Every reference not yet held, saved as PNG whatever the wiki serves it as (it answers images in WebP), or taken as
// One lossless frame of its recording, so each reads the same everywhere after; one line a reference, the path or why
// It is missing
export const fetchReferences = async (): Promise<void> => {
  await mkdir(REFERENCES_DIRECTORY, { recursive: true });
  const missing = Object.entries(ParityReferenceMap).filter(
    ([id]) => !existsSync(join(REFERENCES_DIRECTORY, `${id}.png`)),
  );
  const wikiTitles = missing.flatMap(([, { wikiTitle }]) => (wikiTitle === undefined ? [] : [wikiTitle]));
  const urls = await readWikiFileUrls(wikiTitles);
  const lines = await Promise.all(
    missing.map(async ([id, { capture, crop, seconds, wikiTitle }]) => {
      const path = join(REFERENCES_DIRECTORY, `${id}.png`);
      if (capture !== undefined) {
        const capturePath = join(CAPTURES_DIRECTORY, capture);
        if (!existsSync(capturePath)) return `${id}: no recording at ${capturePath}`;
        const filter = crop ? ["-vf", `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`] : [];
        await runFfmpeg(["-ss", String(seconds), "-i", capturePath, ...filter, "-frames:v", "1", path]);
        return path;
      }
      const url = urls.get(wikiTitle);
      const file = url ? await readWikiFile(url) : undefined;
      if (!file) return `${id}: not on the wiki as ${wikiTitle}`;
      await sharp(file).png().toFile(path);
      return path;
    }),
  );
  for (const line of lines) console.log(line);
};
