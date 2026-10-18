// The Long-Term Encounter Points a player holds: the half points held, which the daily reset does not clear, and the major
// Version they were earned in, which resets them once the game's major version has moved past it
export interface LongTermEncounterPoints {
  halfPoints: number;
  majorVersion: number;
}
