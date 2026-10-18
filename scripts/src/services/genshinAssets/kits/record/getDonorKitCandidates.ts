import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The candidates of the values an overlay borrows from donors: each path takes the value at the path its entry names in
// Its donor's record, which the build has resolved already, so a borrowed value follows its donor as the donor settles
export const getDonorKitCandidates = (
  overlay: KitOverlay,
  donorRecordMap: ReadonlyMap<number, unknown>,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("donor" in entry) || entry.donor === undefined) continue;
    const { characterId, path: donorPath } = entry.donor;
    const donorRecord = donorRecordMap.get(characterId);
    if (donorRecord === undefined)
      throw new InvalidOperationError(
        Operation.Read,
        path,
        `borrows from character ${characterId}, whose record the build has not resolved`,
      );
    const donorValueMap = flattenKitValues(donorRecord);
    if (!donorValueMap.has(donorPath))
      throw new InvalidOperationError(
        Operation.Read,
        path,
        `borrows ${donorPath}, which character ${characterId} lacks`,
      );
    addKitCandidate(candidateMap, path, {
      provenance: {
        cause: KitProvisionalCause.BorrowedFromDonor,
        donor: characterId,
        rule: KitRule.BorrowedFromDonor,
        source: KitSource.Rule,
      },
      value: donorValueMap.get(donorPath),
    });
  }
  return candidateMap;
};
