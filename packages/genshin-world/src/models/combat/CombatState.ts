// The world's combat as its enemies move it: whether the party is in combat, and how long no enemy has been aggravated
// On it, which counts toward leaving combat once the grace period runs out
export interface CombatState {
  clearSeconds: number;
  isInCombat: boolean;
}
