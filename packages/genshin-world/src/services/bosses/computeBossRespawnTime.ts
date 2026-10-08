import { BOSS_RESPAWN_AFTER_CLAIM_DURATION } from "#src/services/bosses/constants";

// When a normal boss comes back, given when its Trounce Blossom was claimed. An unclaimed boss has no time at all, since
// It stays defeated until the player teleports away
export const computeBossRespawnTime = (
  claimedAt: Temporal.ZonedDateTime | undefined,
): Temporal.ZonedDateTime | undefined => claimedAt?.add(BOSS_RESPAWN_AFTER_CLAIM_DURATION);
