import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";

import { readDonorRecordMap } from "#src/services/genshinAssets/kits/readDonorRecordMap";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A kit built after its donors, kept in `builtMap` by character id so each donor is built once
export const buildKitRecordWithDonors = (
  characterId: number,
  inputMap: ReadonlyMap<number, KitInput>,
  builtMap: Map<number, BuiltKit>,
  chain: readonly number[] = [],
): BuiltKit => {
  const built = builtMap.get(characterId);
  if (built !== undefined) return built;
  const input = inputMap.get(characterId);
  if (input === undefined)
    throw new InvalidOperationError(Operation.Read, String(characterId), "is a donor with no input in this build");
  const result = buildKitRecord(
    input.sourceCandidateMap,
    input.overlay,
    readDonorRecordMap(characterId, input.overlay, inputMap, builtMap, [...chain, characterId]),
    input.namedHitCandidateMap,
    input.tables,
    input.gcsimFolder !== undefined,
  );
  builtMap.set(characterId, result);
  return result;
};
