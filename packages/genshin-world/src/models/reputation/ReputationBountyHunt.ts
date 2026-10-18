// A bounty the player has taken: the bounty it is, the region its target spawns in, and whether that target is defeated,
// Which the claim waits on
export interface ReputationBountyHunt {
  bountyId: number;
  isTargetDefeated: boolean;
  regionId: number;
}
