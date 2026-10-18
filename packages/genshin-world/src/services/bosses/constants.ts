import { EnemyKindId } from "#src/models/enemy/EnemyKindId";

// A normal boss comes back this long after its Trounce Blossom is claimed, and not until then while it is unclaimed
export const BOSS_RESPAWN_AFTER_CLAIM_DURATION: Temporal.Duration = Temporal.Duration.from({ seconds: 5 });
// The enemy kinds a weekly boss is, whose defeat leaves a weekly Trounce Blossom rather than a normal boss's
export const WEEKLY_BOSS_ENEMY_KIND_IDS: readonly EnemyKindId[] = [EnemyKindId.StormterrorDvalin];
// The Mora a normal boss's Trounce Blossom pays at each World Level, World Level 0 first. World Level 0 to 8 are read from
// The Basic Drops tab of the wiki's Template:World_Boss_Rewards; World Level 9 has no row there, so it repeats World Level
// 8's until a source gives its own, all provisional until a recording measures them
export const NORMAL_BOSS_MORA: number[] = [3450, 3450, 3650, 3850, 4125, 4450, 4725, 5200, 6000, 6000];
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
  { chance: 0.5556, count: 2 },
];
// The Adventure Rank from which a locked weekly boss's Trounce Domain can be quick challenged from the Adventurer
// Handbook, by the wiki's Weekly Boss page, which says it applies in Single Player Mode
export const WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK = 40;
// The eight quests of Prologue Act III, Song of the Dragon and Freedom, which Stormterror's Trounce Domain opens after,
// Read from the wiki's list of the act and matched to the dump's main quest rows by title. Provisional: the dump leaves
// The domain's own condition empty, so this gate is the wiki's reading until the game's condition is read
export const STORMTERROR_INTRO_QUEST_IDS: readonly number[] = [388, 389, 390, 393, 394, 396, 397, 398];
// The quests that introduce each weekly boss's trounce domain, by its entry id: its domain stays locked until they are done
export const WEEKLY_BOSS_INTRO_QUEST_IDS: Readonly<Record<number, readonly number[]>> = {
  1006: STORMTERROR_INTRO_QUEST_IDS,
};
// The Adventure EXP a normal boss's Trounce Blossom pays at every World Level, from the wiki's Basic Drops tab, which the
// Rank takes as the world's Adventure EXP does. Provisional until a recording measures it
export const NORMAL_BOSS_ADVENTURE_EXP = 200;
// The Companionship EXP each character of the deployed team gets from a normal boss's Trounce Blossom at each World
// Level, World Level 0 first, from the same tab. World Level 9 repeats World Level 8's, provisional like the Mora
export const NORMAL_BOSS_COMPANIONSHIP_EXP: number[] = [30, 30, 30, 35, 35, 40, 40, 45, 45, 45];
// The Mora a weekly boss's claim pays at each row of the wiki's Weekly Boss Rewards Basic Drops tab, Domain Level I to VI,
// Whose boss levels run 40 to 90. The claim maps a World Level onto a row by clamping it into I to VI, provisional until a
// Source gives the World Level's own row
export const WEEKLY_BOSS_MORA: number[] = [6375, 6675, 7100, 7600, 8000, 8100];
// The Companionship EXP each deployed character gets from a weekly boss's claim at each row, from the same tab
export const WEEKLY_BOSS_COMPANIONSHIP_EXP: number[] = [55, 60, 60, 65, 70, 70];
// The Adventure EXP a weekly boss's claim pays at every row, from the same tab
export const WEEKLY_BOSS_ADVENTURE_EXP = 300;
// Dvalin's Plume, Claw and Sigh, the talent materials a weekly boss's claim pays one of, which the wiki names as its exclusives
export const WEEKLY_BOSS_TALENT_ITEM_IDS: number[] = [113003, 113004, 113005];
// The talent count each row pays: its guaranteed count and the chance, as a fraction, of one more. The wiki's tab pays none at
// Rows I to III, but the game's own reward preview lists the three talent materials from III, so the preview decides that they
// Drop there, and III's chance is provisional at the rate VI's extra item carries until the wiki gives one
export const WEEKLY_BOSS_TALENT_DROPS: { chance: number; count: number }[] = [
  { chance: 0, count: 0 },
  { chance: 0, count: 0 },
  { chance: 0.1, count: 0 },
  { chance: 0, count: 1 },
  { chance: 0.55, count: 1 },
  { chance: 0.1, count: 2 },
];
// The Northlander billets a weekly boss's claim pays one of, one per weapon class, and the chance, as a fraction, of one, from
// The same tab; the reward preview lists all five
export const WEEKLY_BOSS_BILLET_ITEM_IDS: number[] = [101101, 101102, 101103, 101104, 101105];
export const WEEKLY_BOSS_BILLET_CHANCE = 0.12;
// The average count of each star tier's Ascension Gem a claim pays, at each row, from the same tab: the two-star Sliver, the
// Three-star Fragment, the four-star Chunk and the five-star Gemstone, zero where a row pays none. A claim's count of a tier is
// The average rounded at random up or down, which keeps its mean
export const WEEKLY_BOSS_GEM_AVERAGES: number[][] = [
  [2.1416, 1.5913, 0, 0],
  [2.4803, 1.6813, 0, 0],
  [2.8181, 1.7717, 0.1881, 0],
  [3.157, 1.8617, 0.2106, 0],
  [3.4963, 1.958, 0.2325, 0.0233],
  [3.8343, 2.423, 0.2556, 0.025],
];
// The gem of each star tier from each of the three families the wiki's page names, Varunada Lazurite, Vajrada Amethyst and
// Vayuda Turquoise, one of which a claim's gem of that tier is, provisional as the wiki gives no split between them
export const WEEKLY_BOSS_GEM_ITEM_IDS: number[][] = [
  [104121, 104141, 104151],
  [104122, 104142, 104152],
  [104123, 104143, 104153],
  [104124, 104144, 104154],
];
// Dream Solvent, the other drop a weekly boss's claim pays, and the chance, as a fraction, of one, from the same tab
export const WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID = 113021;
export const WEEKLY_BOSS_DREAM_SOLVENT_CHANCE = 0.33;
