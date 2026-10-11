import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { GCSIM_PLUNGE_FALLBACK_FOLDER, GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { findGcsimFolder } from "#src/services/genshinAssets/kits/gcsim/findGcsimFolder";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { readGcsimTagCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimTagCharacters";
import { adoptKitParameters } from "#src/services/genshinAssets/kits/module/adoptKitParameters";
import { encodeTalentMultiplierMap } from "#src/services/genshinAssets/kits/module/encodeTalentMultiplierMap";
import { toModuleKitRecord } from "#src/services/genshinAssets/kits/module/toModuleKitRecord";
import { getKitHitLabelMap } from "#src/services/genshinAssets/kits/tables/getKitHitLabelMap";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { readKitTables } from "#src/services/genshinAssets/kits/tables/readKitTables";
import { getWikiKitCandidates } from "#src/services/genshinAssets/kits/wiki/getWikiKitCandidates";
import { readWikiTalentPages } from "#src/services/genshinAssets/kits/wiki/readWikiTalentPages";
import { InvalidOperationError, Operation, toKebabCase } from "@esposter/shared";
import { CharacterIdCreateKitMap } from "genshin-world";

// The values gcsim is expected to give every kit, each by the constant that gives it, so a kit missing one names what
// The reader could not read
const GcsimExpectedPathConstantMap: Record<string, string> = {
  "burst.cancelFrames": "burstFrames",
  "burst.hits.length": "burstHitmark(s)",
  "chargedAttack.hits.length": "chargeHitmark(s) or aimedHitmarks",
  "normalAttacks.0.cancelFrames": "attackFrames",
  "normalAttacks.length": "attackHitmarks",
  "skill.cancelFrames": "skillFrames",
};

// What the builder reads for every character with a kit module, or the named ones: the record each module holds today,
// Built from the published multipliers and again from encoded ones with its literals a table holds at every level taken
// As the table's, and the candidates gcsim's tag, the wiki and the tables give its record. gcsim's tag is read from its
// Clone and the wiki's answers from their cache, each fetched first where it is absent
export const readKitInputs = async ({
  characterIds = Object.keys(CharacterIdCreateKitMap).map(Number),
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
  const tablesMap = await readKitTables(characterIds);
  const inputs: KitInput[] = [];
  for (const [characterId, tables] of tablesMap) {
    const createKit = CharacterIdCreateKitMap[characterId];
    if (createKit === undefined)
      throw new InvalidOperationError(Operation.Read, String(characterId), "has no kit module");
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
    const kit = createKit(tables.talentMultiplierMap);
    const encodedKit = createKit(encodeTalentMultiplierMap(tables.talentMultiplierMap));
    const sourceCandidateMap = mergeKitCandidates(
      gcsimCandidateMap,
      getWikiKitCandidates(pages, tables, getKitHitLabelMap(gcsimTableCandidateMap, tables)),
      tableCandidateMap,
    );
    inputs.push({
      characterId,
      gcsimFolder,
      moduleRecord: adoptKitParameters(
        toModuleKitRecord(kit, encodedKit, tables.element, tables.talentMultiplierMap),
        sourceCandidateMap,
        tables.talentMultiplierMap,
      ),
      name: tables.name,
      notes,
      overlayName: toKebabCase(tables.name),
      sourceCandidateMap,
      tables,
    });
  }
  return inputs;
};
