// What a claim costs: `resin` of Original Resin, or `condensedResinCount` of Condensed Resin where that count is above
// Zero, which takes no Original Resin. A blossom's offer, a domain's cost and a boss's are each one of these
export interface ResinCost {
  condensedResinCount: number;
  resin: number;
}
