import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";

import { readKitOverlay } from "#src/services/genshinAssets/kits/readKitOverlay";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Every kit's record and sources from its sources and committed overlay, as the entries of the `kits` and `kitSources`
// Indexes by avatar id. A record must reproduce its module's values exactly, so a kit whose overlay has fallen behind
// Its module fails the publish, naming the paths that differ
export const buildKitPublication = (inputs: readonly KitInput[]): GameDataPublication => {
  const kits: Record<string, unknown> = {};
  const kitSources: Record<string, unknown> = {};
  const failures: string[] = [];
  for (const { characterId, moduleRecord, name, overlayName, sourceCandidateMap } of inputs) {
    const { record, sources } = buildKitRecord(sourceCandidateMap, readKitOverlay(overlayName));
    const mismatchedPaths = getMismatchedKitPaths(record, moduleRecord);
    if (mismatchedPaths.length > 0) failures.push(`${name}: ${mismatchedPaths.join(", ")}`);
    kits[String(characterId)] = record;
    kitSources[String(characterId)] = sources;
  }
  if (failures.length > 0)
    throw new InvalidOperationError(
      Operation.Create,
      buildKitPublication.name,
      `the records differ from their modules, so run --compare first:\n${failures.join("\n")}`,
    );
  return { indexes: { [GameDataset.Kits]: kits, [GameDataset.KitSources]: kitSources }, objects: {} };
};
