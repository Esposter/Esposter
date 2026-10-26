import type { TrounceBlossomSave } from "#src/models/bosses/TrounceBlossomSave";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { MAX_BLOSSOM_CLAIM_COUNT } from "#src/services/save/constants";

// A Trounce Blossom as the save holds it. Only its newest claims are written: a weekly boss's blossom takes one claim a
// week, so these reach back over a year, and a normal boss's respawn reads its last claim alone
export const toTrounceBlossomSave = (trounceBlossom: TrounceBlossom): TrounceBlossomSave => {
  const claimedAts = trounceBlossom.claimedAts.slice(-MAX_BLOSSOM_CLAIM_COUNT).map((claimedAt) => claimedAt.toString());
  return trounceBlossom.kind === BlossomKind.NormalBoss
    ? {
        claimedAts,
        kind: BlossomKind.NormalBoss,
        place: trounceBlossom.place,
        uniqueDropId: trounceBlossom.uniqueDropId,
      }
    : { claimedAts, kind: BlossomKind.WeeklyBoss, place: trounceBlossom.place };
};
