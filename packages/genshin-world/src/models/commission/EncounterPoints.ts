// The Encounter Points the player holds, counted in half points so a half point is held whole, and the daily reset they
// Were earned on: the points held before a later daily reset are gone with it
export interface EncounterPoints {
  earnedOn: Temporal.Instant;
  halfPoints: number;
}
