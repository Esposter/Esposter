import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { TrialAvatar } from "genshin-world";

import { toTrialAvatar } from "#src/services/genshinAssets/trials/toTrialAvatar";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The trial avatars a season's opening characters play as, one per trial id the avatar config names and in that order, each
// Read from the trial avatar table: the character it is and the level it holds. A trial id the table lacks is refused
export const toImaginariumOpeningTrials = (
  openingTrialIds: number[],
  trialAvatarRowMap: Map<number, ExcelTrialAvatarRow>,
): TrialAvatar[] =>
  openingTrialIds.map((trialAvatarId) => {
    const row = trialAvatarRowMap.get(trialAvatarId);
    if (!row)
      throw new InvalidOperationError(
        Operation.Read,
        String(trialAvatarId),
        "names a trial avatar the trial table lacks",
      );
    return toTrialAvatar(row);
  });
