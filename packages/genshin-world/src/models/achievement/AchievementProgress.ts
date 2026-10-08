// How far an achievement has come: how many of its counted doings have happened, and the moment it was finished, which is
// Absent until it is
export interface AchievementProgress {
  count: number;
  finishedAt?: Temporal.Instant;
}
