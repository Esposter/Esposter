import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

import { buildKitRecordWithDonors } from "#src/services/genshinAssets/kits/buildKitRecordWithDonors";
import { omitConstellation } from "#src/services/genshinAssets/kits/omitConstellation";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { throwCollectedFailures } from "#src/services/shared/throwCollectedFailures";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import {
  buildKit,
  createTalentLevelMap,
  GameDataset,
  readCreateKitBehaviour,
  TALENT_START_LEVELS,
} from "genshin-world";

// Every kit's record and sources from its sources and committed overlay, as the entries of the `kits` and `kitSources`
// Indexes by avatar id, each kit built after the donors its overlay borrows from. A record must reproduce its published
// Values exactly unless its kit is one the publish means to change, so a kit whose overlay or sources moved unasked
// Fails the publish, naming the paths that differ. A kit with no published record is one the publish means to add, so
// It must be named among the changed ones too. Every kit, named or not, also builds into a kit from its behaviour
// Module, so a record that module cannot read fails the publish
export const buildKitPublication = async (
  inputs: readonly KitInput[],
  changedCharacterIds: readonly number[] = [],
): Promise<GameDataPublication> => {
  const inputMap = new Map(inputs.map((input) => [input.characterId, input]));
  const builtMap = new Map<number, BuiltKit>();
  const kits: Record<string, unknown> = {};
  const kitSources: Record<string, unknown> = {};
  const failures: string[] = [];
  const behaviouredInputs = await Promise.all(
    inputs.map(async (input) => ({ ...input, createBehaviour: await readCreateKitBehaviour(input.characterId) })),
  );
  for (const { characterId, createBehaviour, name, publishedRecord, tables } of behaviouredInputs) {
    const { record, sources } = getResult(() => buildKitRecordWithDonors(characterId, inputMap, builtMap)).match(
      (built) => built,
      (error) => {
        throw new InvalidOperationError(Operation.Create, name, `its record cannot be built: ${error.message}`);
      },
    );
    getResult(() =>
      buildKit(
        record,
        tables.talentMultiplierMap,
        createTalentLevelMap(tables.talentGroupIdMap, TALENT_START_LEVELS),
        createBehaviour,
      ),
    ).match(noop, (error) => {
      failures.push(`${name}: its kit cannot be built: ${error.message}`);
    });
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
