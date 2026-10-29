import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Every wiki reference not yet held, saved as PNG whatever the wiki serves it as (it answers images in WebP), so each
// Reads the same everywhere after; one line a reference, the path or why it is missing. A screenshot sampled from a
// Recording is saved there by a person, so one that is absent is named with where it is sampled from
export const fetchReferences = async (): Promise<void> => {
  await mkdir(REFERENCES_DIRECTORY, { recursive: true });
  // A pending screen names no reference to fetch, so it is never asked of the wiki
  const missing = Object.entries(ParityReferenceMap).filter(
    ([id, { pending }]) => pending === undefined && !existsSync(join(REFERENCES_DIRECTORY, `${id}.png`)),
  );
  const wikiTitles = missing.flatMap(([, { wikiTitle }]) => (wikiTitle === undefined ? [] : [wikiTitle]));
  const urls = wikiTitles.length > 0 ? await readWikiFileUrls(wikiTitles) : new Map<string, string>();
  const lines = await Promise.all(
    missing.map(async ([id, { placement, source, wikiTitle }]) => {
      const path = join(REFERENCES_DIRECTORY, `${id}.png`);
      if (source !== undefined) return `${id}: no screenshot at ${path}, sampled from ${source}`;
      const url = wikiTitle === undefined ? undefined : urls.get(wikiTitle);
      const file = url ? await readWikiFile(url) : undefined;
      if (!file) return `${id}: not on the wiki as ${wikiTitle}`;
      // A crop placed in its frame is drawn on the frame's black, so the reference is the whole frame at its scale. One
      // That no longer fits where it is placed is a file the wiki has changed, so it is reported rather than drawn
      if (placement) {
        const { height, width } = await sharp(file).metadata();
        if (placement.x + width > placement.frameWidth || placement.y + height > placement.frameHeight)
          return `${id}: ${width}×${height} on the wiki no longer fits its frame at ${placement.x}, ${placement.y}`;
        await sharp({
          create: { background: "#000", channels: 3, height: placement.frameHeight, width: placement.frameWidth },
        })
          .composite([{ input: await sharp(file).png().toBuffer(), left: placement.x, top: placement.y }])
          .png()
          .toFile(path);
      } else await sharp(file).png().toFile(path);
      return path;
    }),
  );
  for (const line of lines) console.log(line);
};
