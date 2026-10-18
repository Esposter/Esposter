import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitRecord } from "genshin-world";

import { readPublishedGameDataEntries } from "#src/services/gameData/readPublishedGameDataEntries";
import { readPublishedGameDataIndex } from "#src/services/gameData/readPublishedGameDataIndex";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { checkIsGcsimValueGiven } from "#src/services/genshinAssets/kits/checkIsGcsimValueGiven";
import { GCSIM_PLUNGE_FALLBACK_FOLDER, GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { findGcsimFolder } from "#src/services/genshinAssets/kits/gcsim/findGcsimFolder";
import { getFallbackPlungeKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getFallbackPlungeKitCandidates";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { getGcsimNamedHitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimNamedHitCandidates";
import { readGcsimCitedCandidates } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedCandidates";
import { readGcsimTagCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimTagCharacters";
import { getKitBagPaths } from "#src/services/genshinAssets/kits/getKitBagPaths";
import { readKitOverlay } from "#src/services/genshinAssets/kits/readKitOverlay";
import { getKitHitLabelMap } from "#src/services/genshinAssets/kits/tables/getKitHitLabelMap";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { readKitTablesWithDonors } from "#src/services/genshinAssets/kits/tables/readKitTablesWithDonors";
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

// What the builder reads for every character with a published kit, the named ones alone, or both where every published
// Kit is read beside them, as a publish reads them: the record published for each, if one is, and the candidates gcsim's
// Tag, the wiki and the tables give its record. gcsim's tag is read from its clone and the wiki's answers from their
// Cache, each fetched first where it is absent
export const readKitInputs = async ({
  characterIds,
  gcsimDirectory,
  isEveryPublishedKitRead = false,
  wikiCacheDirectory,
}: {
  characterIds?: readonly number[];
  gcsimDirectory: string;
  isEveryPublishedKitRead?: boolean;
  wikiCacheDirectory: string;
}): Promise<KitInput[]> => {
  const tagCharacterMap = readGcsimTagCharacters(gcsimDirectory);
  const plungeFallback = tagCharacterMap.get(GCSIM_PLUNGE_FALLBACK_FOLDER);
  if (plungeFallback === undefined)
    throw new InvalidOperationError(Operation.Read, GCSIM_PLUNGE_FALLBACK_FOLDER, `has no folder at ${GCSIM_TAG}`);
  const publishedIds = new Set(Object.keys(await readPublishedGameDataIndex(GameDataset.Kits)));
  const requestedIds =
    characterIds === undefined
      ? [...publishedIds]
      : [...new Set([...(isEveryPublishedKitRead ? publishedIds : []), ...characterIds.map(String)])];
  // The donors of each requested kit are read beside it, since a borrower is built after its donors
  const tablesMap = await readKitTablesWithDonors(requestedIds.map(Number));
  const ids = [...tablesMap.keys()].map(String);
  const publishedRecordMap = await readPublishedGameDataEntries<KitRecord>(
    GameDataset.Kits,
    ids.filter((id) => publishedIds.has(id)),
  );
  const inputs: KitInput[] = [];
  for (const id of ids) {
    const characterId = Number(id);
    const publishedRecord = publishedRecordMap.get(id);
    const tables = tablesMap.get(characterId);
    if (tables === undefined) throw new InvalidOperationError(Operation.Read, String(characterId), "has no tables");
    const notes: string[] = [];
    const overlayName = toKebabCase(tables.name);
    const gcsimFolder = findGcsimFolder(tagCharacterMap, tables.name);
    const gcsim = gcsimFolder === undefined ? undefined : tagCharacterMap.get(gcsimFolder);
    if (gcsim === undefined) notes.push(`no gcsim folder at ${GCSIM_TAG}`);
    // oxlint-disable-next-line no-await-in-loop -- one category request at a time, which the wiki asks of a client
    const pages = await readWikiTalentPages(tables.name, wikiCacheDirectory);
    if (pages.length === 0) notes.push("no wiki talent pages");
    const overlay = readKitOverlay(overlayName);
    const gcsimCandidateMap: Map<string, KitCandidate[]> = mergeKitCandidates(
      gcsim === undefined
        ? getFallbackPlungeKitCandidates(plungeFallback, tables)
        : getGcsimKitCandidates(gcsim, tables, plungeFallback, getKitBagPaths(publishedRecord ?? {}, overlay)),
      gcsimFolder === undefined ? new Map() : readGcsimCitedCandidates(overlay, gcsimDirectory, gcsimFolder),
    );
    const namedHitCandidateMap = gcsim === undefined ? new Map() : getGcsimNamedHitCandidates(gcsim, tables);
    if (gcsim !== undefined)
      for (const [path, constant] of Object.entries(GcsimExpectedPathConstantMap))
        if (!checkIsGcsimValueGiven(gcsimCandidateMap.get(path))) notes.push(`gcsim gives no ${constant}`);
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
      namedHitCandidateMap,
      notes,
      overlay,
      overlayName,
      ...(publishedRecord && { publishedRecord }),
      sourceCandidateMap,
      tables,
    });
  }
  return inputs;
};
