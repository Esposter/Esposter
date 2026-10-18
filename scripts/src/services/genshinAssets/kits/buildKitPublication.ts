import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";

import { buildKitRecordWithDonors } from "#src/services/genshinAssets/kits/buildKitRecordWithDonors";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Every kit's record and sources from its sources and committed overlay, as the entries of the `kits` and `kitSources`
// Indexes by avatar id, each kit built after the donors its overlay borrows from. A record must reproduce its published
// Values exactly unless its kit is one the publish means to change, so a kit whose overlay or sources moved unasked fails
// The publish, naming the paths that differ. A kit with no published record is one the publish means to add, so it must
// Be named among the changed ones too
export const buildKitPublication = (
  inputs: readonly KitInput[],
  changedCharacterIds: readonly number[] = [],
): GameDataPublication => {
  const inputMap = new Map(inputs.map((input) => [input.characterId, input]));
  const builtMap = new Map<number, BuiltKit>();
  const kits: Record<string, unknown> = {};
  const kitSources: Record<string, unknown> = {};
  const failures: string[] = [];
  for (const { characterId, name, publishedRecord, tables } of inputs) {
    let built: BuiltKit;
    try {
      built = buildKitRecordWithDonors(characterId, inputMap, builtMap);
    } catch (error) {
      throw new InvalidOperationError(
        Operation.Create,
        name,
        `its record cannot be built: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    const { record, sources } = built;
    kits[String(characterId)] = record;
    kitSources[String(characterId)] = sources;
    if (changedCharacterIds.includes(characterId)) continue;
    if (publishedRecord === undefined) {
      failures.push(`${name}: has no published kit`);
      continue;
    }
    const mismatchedPaths = getMismatchedKitPaths(record, publishedRecord, tables.talentMultiplierMap);
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
