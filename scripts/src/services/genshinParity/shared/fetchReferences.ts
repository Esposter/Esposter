import { readReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { getScratchPlatePath } from "#src/services/genshinParity/shared/getScratchPlatePath";
import { getScratchReferencePath } from "#src/services/genshinParity/shared/getScratchReferencePath";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "genshin-persona/src/services/readWikiFileUrls.ts";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Fetches every wiki reference not yet committed into the scratch folder, where `references pack` reads it.
// It names each one that stays missing.
// A wiki file is written as the wiki serves it: its bytes are sniffed by pack, never its name.
// A recording's frame is never fetched, so a missing one is named with its source and the scratch path to save its cut at
export const fetchReferences = async (): Promise<void> => {
  await mkdir(REFERENCE_SCRATCH_DIRECTORY, { recursive: true });
  const references = await readReferenceFiles();
  // A pending screen names no reference to fetch, so it is never asked of the wiki
  const missing = references.filter(({ id, path }) => !existsSync(path) && !existsSync(getScratchReferencePath(id)));
  const wikiTitles = missing.flatMap(({ reference }) =>
    reference.wikiTitle === undefined ? [] : [reference.wikiTitle],
  );
  const urls = wikiTitles.length > 0 ? await readWikiFileUrls(wikiTitles) : new Map<string, string>();
  const missingPlates = references.flatMap(({ id, reference }) =>
    reference.plateSource === undefined ||
    existsSync(getReferencePlateFilePath(id)) ||
    existsSync(getScratchPlatePath(id))
      ? []
      : [
          `${id}: no plate at ${getScratchPlatePath(id)}, sampled from ${reference.plateSource}; run genshin:parity references pack`,
        ],
  );
  const lines = await Promise.all(
    missing.map(async ({ id, reference }): Promise<string> => {
      const { placement, source, wikiTitle } = reference;
      if (source !== undefined)
        return `${id}: no screenshot, sampled from ${source}; save its cut at ${getScratchReferencePath(id)} and run genshin:parity references pack`;
      const url = wikiTitle === undefined ? undefined : urls.get(wikiTitle);
      const file = url ? await readWikiFile(url) : undefined;
      if (!file) return `${id}: not on the wiki as ${wikiTitle}`;
      // A crop placed in its frame is drawn on the frame's black, so the reference is the whole frame at its scale. One
      // That no longer fits where it is placed is a file the wiki has changed, so it is reported rather than drawn
      let image: Uint8Array = file;
      if (placement) {
        const { height, width } = await sharp(file).metadata();
        if (placement.x + width > placement.frameWidth || placement.y + height > placement.frameHeight)
          return `${id}: ${width}×${height} on the wiki no longer fits its frame at ${placement.x}, ${placement.y}`;
        image = await sharp({
          create: { background: "#000", channels: 3, height: placement.frameHeight, width: placement.frameWidth },
        })
          .composite([{ input: await sharp(file).png().toBuffer(), left: placement.x, top: placement.y }])
          .png()
          .toBuffer();
      }
      const path = getScratchReferencePath(id);
      await writeFile(path, image);
      return path;
    }),
  );
  // On stderr: `compare` calls this on every run, and its stdout is one JSON line per comparison
  for (const line of [...lines, ...missingPlates]) console.error(line);
};
