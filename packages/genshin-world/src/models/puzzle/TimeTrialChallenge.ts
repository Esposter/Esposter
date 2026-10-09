import type { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";

// A Time Trial Challenge: its clock's limit and what is left of it once started, and how many of its targets are struck
// Against how many it asks for, every one of them due before the clock runs out
export interface TimeTrialChallenge {
  limitSeconds: number;
  remainingSeconds: number;
  state: TimeTrialChallengeState;
  struckCount: number;
  targetCount: number;
}
