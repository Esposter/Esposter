// A chamber being fought: the halves it has had cleared out of its teams, the seconds left on its one clock, and the
// Ley Line Monolith's health as a percent, undefined for a chamber with no monolith
export interface AbyssChallenge {
  defeatedHalfCount: number;
  halfCount: number;
  monolithPercent?: number;
  secondsLeft: number;
}
