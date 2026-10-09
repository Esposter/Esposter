// What an expedition is sent under, read off the player's progress at the moment it is sent: their Adventure Rank, the
// Quests they have finished, the scene points of the statues they have resonated with, the most expeditions they may
// Have out, whether the character is down, and the moment
export interface ExpeditionContext {
  adventureRank: number;
  completedQuestIds: ReadonlySet<string>;
  expeditionLimit: number;
  isCharacterDown: boolean;
  now: Temporal.Instant;
  unlockedStatuePointIds: ReadonlySet<number>;
}
