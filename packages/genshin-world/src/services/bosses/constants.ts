// A normal boss comes back this long after its Trounce Blossom is claimed, and not until then while it is unclaimed
export const BOSS_RESPAWN_AFTER_CLAIM_DURATION: Temporal.Duration = Temporal.Duration.from({ seconds: 5 });
// The Mora a normal boss's Trounce Blossom pays at each World Level, World Level 0 first. Read from the Basic Drops tab
// Of the wiki's Template:World_Boss_Rewards, provisional until a recording measures it
export const NORMAL_BOSS_MORA: number[] = [3450, 3450, 3650, 3850, 4125, 4450, 4725, 5200, 6000];
// The boss's own drop a normal boss's Trounce Blossom pays at each World Level: its guaranteed count, and the chance,
// As a fraction, of one more. Read from the same tab as the Mora, provisional until a recording measures it
export const NORMAL_BOSS_UNIQUE_DROPS: { chance: number; count: number }[] = [
  { chance: 0.6185, count: 1 },
  { chance: 0.6185, count: 1 },
  { chance: 0.7037, count: 1 },
  { chance: 0.8741, count: 1 },
  { chance: 0.0445, count: 2 },
  { chance: 0.2149, count: 2 },
  { chance: 0.3852, count: 2 },
  { chance: 0.5556, count: 2 },
  { chance: 0.5556, count: 2 },
];
