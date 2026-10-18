// A bounty the player has taken: the bounty it is, the region its target spawns in at the region's centre, the kind of
// The target drawn for it, and whether that target is defeated, which the claim waits on
export interface ReputationBountyHunt {
  bountyId: number;
  isTargetDefeated: boolean;
  regionId: number;
  spawn: [number, number, number];
  targetEnemyKindId: number;
}
