// How far an achievement has come: how many of its counted doings have happened, and the moment it was finished, which is
// Absent until it is. An unfinished achievement also holds the target ids it has counted, so a named target counts once
// Only, and it is held for the session alone, since a named quest's step passes once and a saved one cannot pass it again
export interface AchievementProgress {
  count: number;
  countedTargetIds?: string[];
  finishedAt?: Temporal.Instant;
}
