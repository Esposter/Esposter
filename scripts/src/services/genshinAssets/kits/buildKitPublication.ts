import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";

import { readKitOverlay } from "#src/services/genshinAssets/kits/readKitOverlay";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Every kit's record and sources from its sources and committed overlay, as the entries of the `kits` and `kitSources`
// Indexes by avatar id. A record must reproduce its published values exactly unless its kit is one the publish means to
// Change, so a kit whose overlay or sources moved unasked fails the publish, naming the paths that differ. A kit with no
// Published record is one the publish means to add, so it must be named among the changed ones too
export const buildKitPublication = (
  inputs: readonly KitInput[],
  changedCharacterIds: readonly number[] = [],
): GameDataPublication => {
  const kits: Record<string, unknown> = {};
  const kitSources: Record<string, unknown> = {};
  const failures: string[] = [];
  for (const {
    characterId,
    gcsimFolder,
    name,
    namedHitCandidateMap,
    overlayName,
    publishedRecord,
    sourceCandidateMap,
    tables,
  } of inputs) {
    const { record, sources } = buildKitRecord(
      sourceCandidateMap,
      readKitOverlay(overlayName),
      namedHitCandidateMap,
      tables.talentGroupIdMap,
      gcsimFolder !== undefined,
    );
    kits[String(characterId)] = record;
    kitSources[String(characterId)] = sources;
    if (changedCharacterIds.includes(characterId)) continue;
    if (publishedRecord === undefined) {
      failures.push(`${name}: has no published kit`);
      continue;
    }
    const mismatchedPaths = getMismatchedKitPaths(record, publishedRecord);
    if (mismatchedPaths.length > 0) failures.push(`${name}: ${mismatchedPaths.join(", ")}`);
  }
  if (failures.length > 0)
    throw new InvalidOperationError(
      Operation.Create,
      buildKitPublication.name,
      `the records differ from their published ones, so name each kit meant to change in --only:\n${failures.join("\n")}`,
    );
  return { indexes: { [GameDataset.Kits]: kits, [GameDataset.KitSources]: kitSources }, objects: {} };
};
