import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

import { checkIsMultiClaimBlossom } from "#src/services/originalResin/checkIsMultiClaimBlossom";
import { computeBlossomClaimResin } from "#src/services/originalResin/computeBlossomClaimResin";
import { CONDENSED_RESIN_CLAIM_COUNT } from "#src/services/originalResin/constants";

// The ways a claim at a blossom can be paid: one claim at its price, and at a ley line or a domain two claims at twice
// The price, or a Condensed Resin for its three rewards
export const computeBlossomClaimOffers = (kind: BlossomKind, weeklyBossClaimsMade: number): BlossomClaimOffer[] => {
  const resin = computeBlossomClaimResin(kind, weeklyBossClaimsMade);
  const singleOffer: BlossomClaimOffer = { claimCount: 1, condensedResinCount: 0, resin };
  if (!checkIsMultiClaimBlossom(kind)) return [singleOffer];
  return [
    singleOffer,
    { claimCount: 2, condensedResinCount: 0, resin: resin * 2 },
    { claimCount: CONDENSED_RESIN_CLAIM_COUNT, condensedResinCount: 1, resin: 0 },
  ];
};
