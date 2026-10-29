import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { readDonorRecordMap } from "#src/services/genshinAssets/kits/readDonorRecordMap";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The records of a kit's donors, each built through `buildKitRecordWithDonors` so a donor shared by several kits is built once
export const readBuiltDonorRecordMap = (
  characterId: number,
  overlay: KitOverlay,
  inputMap: ReadonlyMap<number, KitInput>,
  builtMap: Map<number, BuiltKit>,
  chain?: readonly number[],
): Map<number, unknown> =>
  readDonorRecordMap(
    characterId,
    overlay,
    (donorId, donorChain) => buildKitRecordWithDonors(donorId, inputMap, builtMap, donorChain).record,
    chain,
  );

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
    readBuiltDonorRecordMap(characterId, input.overlay, inputMap, builtMap, [...chain, characterId]),
    input.namedHitCandidateMap,
    input.tables,
    input.gcsimFolder !== undefined,
  );
  builtMap.set(characterId, result);
  return result;
};
