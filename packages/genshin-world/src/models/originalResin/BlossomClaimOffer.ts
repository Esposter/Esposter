// One way to pay a claim at a blossom: `claimCount` claims for `resin` of Original Resin, or for `condensedResinCount` of
// Condensed Resin, which takes no resin
export interface BlossomClaimOffer {
  claimCount: number;
  condensedResinCount: number;
  resin: number;
}
