import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

import { computeBlossomClaimOffers } from "#src/services/originalResin/computeBlossomClaimOffers";

// The ways a claim at a blossom can be paid with what is held: a resin offer while the Original Resin covers its price,
// And a Condensed Resin offer while the bag holds the Condensed Resin it takes. An offer the holdings cannot pay is left out
export const computeAffordableBlossomClaimOffers = (
  kind: BlossomKind,
  weeklyBossClaimsMade: number,
  originalResin: number,
  condensedResinCount: number,
): BlossomClaimOffer[] =>
  computeBlossomClaimOffers(kind, weeklyBossClaimsMade).filter(
    ({ condensedResinCount: offerCondensedResinCount, resin }) =>
      offerCondensedResinCount > 0 ? condensedResinCount >= offerCondensedResinCount : originalResin >= resin,
  );
