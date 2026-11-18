// One Trust Rank: the Trust EXP it takes to pass it, the companions the realm holds at it, and the most Realm Currency and
// Realm Bounty each store holds at it. The last rank has no EXP to pass
export interface HomeTrustLevel {
  bountyStoreLimit: number;
  coinStoreLimit: number;
  exp: number;
  level: number;
  npcCount: number;
}
