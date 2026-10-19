import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";

import { buildKitRecordWithDonors } from "#src/services/genshinAssets/kits/buildKitRecordWithDonors";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { throwCollectedFailures } from "#src/services/shared/throwCollectedFailures";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// A multiplier's constellation is the join key its build reads a talent variable at, which the published shape omits
const omitConstellation = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((element) => omitConstellation(element));
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "constellation")
      .map(([key, child]): [string, unknown] => [key, omitConstellation(child)]),
  );
};

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
    const { record, sources } = getResult(() => buildKitRecordWithDonors(characterId, inputMap, builtMap)).match(
      (built) => built,
      (error) => {
        throw new InvalidOperationError(Operation.Create, name, `its record cannot be built: ${error.message}`);
      },
    );
    kits[String(characterId)] = omitConstellation(record);
    kitSources[String(characterId)] = sources;
    if (changedCharacterIds.includes(characterId)) continue;
    if (publishedRecord === undefined) {
      failures.push(`${name}: has no published kit`);
      continue;
    }
    const mismatchedPaths = getMismatchedKitPaths(record, publishedRecord, tables.talentMultiplierMap);
    if (mismatchedPaths.length > 0) failures.push(`${name}: ${mismatchedPaths.join(", ")}`);
  }
  throwCollectedFailures(
    Operation.Create,
    buildKitPublication.name,
    "the records differ from their published ones, so name each kit meant to change in --only",
    failures,
  );
  return { indexes: { [GameDataset.Kits]: kits, [GameDataset.KitSources]: kitSources }, objects: {} };
};
