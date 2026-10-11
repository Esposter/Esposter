// A Moondrift Harmony hit on its way to an enemy: the ids of the characters contributing to it, the id of the character
// Whose Lunar-Crystallize resonated it, and the seconds until it lands
export interface MoondriftHarmonyHit {
  contributorIds: ReadonlySet<number>;
  ownerId: number;
  secondsRemaining: number;
}
