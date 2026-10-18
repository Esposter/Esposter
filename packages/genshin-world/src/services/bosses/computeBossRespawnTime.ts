import { BOSS_RESPAWN_AFTER_CLAIM_DURATION } from "#src/services/bosses/constants";

// When a normal boss comes back, given when its Trounce Blossom was last claimed. An unclaimed boss has no time at all,
// Since it stays defeated until the player teleports away
export const computeBossRespawnTime = (claimedAts: readonly Temporal.Instant[]): Temporal.Instant | undefined =>
  claimedAts.at(-1)?.add(BOSS_RESPAWN_AFTER_CLAIM_DURATION);
