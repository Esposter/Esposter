import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { TrounceBlossomSave } from "#src/models/bosses/TrounceBlossomSave";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// A saved Trounce Blossom read back as the world holds it, its claims as instants
export const toTrounceBlossom = (trounceBlossomSave: TrounceBlossomSave): TrounceBlossom => {
  const claimedAts = trounceBlossomSave.claimedAts.map((claimedAt) => Temporal.Instant.from(claimedAt));
  return trounceBlossomSave.kind === BlossomKind.NormalBoss
    ? {
        claimedAts,
        kind: BlossomKind.NormalBoss,
        place: trounceBlossomSave.place,
        uniqueDropId: trounceBlossomSave.uniqueDropId,
      }
    : { claimedAts, kind: BlossomKind.WeeklyBoss, place: trounceBlossomSave.place };
};
