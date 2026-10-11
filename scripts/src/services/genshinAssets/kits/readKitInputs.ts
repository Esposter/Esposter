import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitRecord } from "genshin-world";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { readPublishedGameDataEntries } from "#src/services/gameData/readPublishedGameDataEntries";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { GCSIM_PLUNGE_FALLBACK_FOLDER, GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { findGcsimFolder } from "#src/services/genshinAssets/kits/gcsim/findGcsimFolder";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { readGcsimTagCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimTagCharacters";
import { getKitHitLabelMap } from "#src/services/genshinAssets/kits/tables/getKitHitLabelMap";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { readKitTables } from "#src/services/genshinAssets/kits/tables/readKitTables";
import { getWikiKitCandidates } from "#src/services/genshinAssets/kits/wiki/getWikiKitCandidates";
import { readWikiTalentPages } from "#src/services/genshinAssets/kits/wiki/readWikiTalentPages";
import { InvalidOperationError, Operation, toKebabCase } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The values gcsim is expected to give every kit, each by the constant that gives it, so a kit missing one names what
// The reader could not read
const GcsimExpectedPathConstantMap: Record<string, string> = {
  "burst.animationFrames": "burstFrames",
  "burst.hits.length": "burstHitmark(s)",
  "chargedAttack.hits.length": "chargeHitmark(s) or aimedHitmarks",
  "normalAttacks.0.animationFrames": "attackFrames",
  "normalAttacks.length": "attackHitmarks",
  "skill.animationFrames": "skillFrames",
};

// What the builder reads for every character with a published kit, or the named ones: the record published for it, and
// The candidates gcsim's tag, the wiki and the tables give its record. gcsim's tag is read from its clone and the wiki's
// Answers from their cache, each fetched first where it is absent
export const readKitInputs = async ({
  characterIds,
  gcsimDirectory,
  wikiCacheDirectory,
}: {
  characterIds?: readonly number[];
  gcsimDirectory: string;
  wikiCacheDirectory: string;
}): Promise<KitInput[]> => {
  const tagCharacterMap = readGcsimTagCharacters(gcsimDirectory);
  const plungeFallback = tagCharacterMap.get(GCSIM_PLUNGE_FALLBACK_FOLDER);
  if (plungeFallback === undefined)
    throw new InvalidOperationError(Operation.Read, GCSIM_PLUNGE_FALLBACK_FOLDER, `has no folder at ${GCSIM_TAG}`);
  const publishedRecordMap = await readPublishedGameDataEntries<KitRecord>(GameDataset.Kits, characterIds?.map(String));
  const tablesMap = await readKitTables(Array.from(publishedRecordMap.keys(), Number));
  const inputs: KitInput[] = [];
  for (const [id, publishedRecord] of publishedRecordMap) {
    const characterId = Number(id);
    const tables = tablesMap.get(characterId);
    if (tables === undefined) throw new InvalidOperationError(Operation.Read, String(characterId), "has no tables");
    const notes: string[] = [];
    const gcsimFolder = findGcsimFolder(tagCharacterMap, tables.name);
    const gcsim = gcsimFolder === undefined ? undefined : tagCharacterMap.get(gcsimFolder);
    if (gcsim === undefined) notes.push(`no gcsim folder at ${GCSIM_TAG}`);
    // oxlint-disable-next-line no-await-in-loop -- one category request at a time, which the wiki asks of a client
    const pages = await readWikiTalentPages(tables.name, wikiCacheDirectory);
    if (pages.length === 0) notes.push("no wiki talent pages");
    const gcsimCandidateMap: Map<string, KitCandidate[]> =
      gcsim === undefined ? new Map() : getGcsimKitCandidates(gcsim, tables, plungeFallback);
    if (gcsim !== undefined)
      for (const [path, constant] of Object.entries(GcsimExpectedPathConstantMap))
        if (gcsimCandidateMap.get(path)?.some(({ provenance }) => provenance.source === KitSource.Gcsim) !== true)
          notes.push(`gcsim gives no ${constant}`);
    const tableCandidateMap = getTableKitCandidates(tables);
    const gcsimTableCandidateMap = mergeKitCandidates(gcsimCandidateMap, tableCandidateMap);
    const sourceCandidateMap = mergeKitCandidates(
      gcsimCandidateMap,
      getWikiKitCandidates(pages, tables, getKitHitLabelMap(gcsimTableCandidateMap, tables)),
      tableCandidateMap,
    );
    inputs.push({
      characterId,
      gcsimFolder,
      name: tables.name,
      notes,
      overlayName: toKebabCase(tables.name),
      publishedRecord,
      sourceCandidateMap,
      tables,
    });
  }
  return inputs;
};
