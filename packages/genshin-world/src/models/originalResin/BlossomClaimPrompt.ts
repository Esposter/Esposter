import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";

// What pressing F at a revealed blossom shows: the claims the holdings afford, and whether a Fragile Resin can restore
// Original Resin where the Original Resin covers no resin claim, after which the claims are offered again
export interface BlossomClaimPrompt {
  canRestore: boolean;
  offers: BlossomClaimOffer[];
}
