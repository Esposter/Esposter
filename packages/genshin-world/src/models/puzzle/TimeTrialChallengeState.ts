// A Time Trial Challenge's place in its puzzle: waiting for its marker, running its clock, done with every target in time,
// Or out of time before it
export const TimeTrialChallengeState = {
  Failed: "Failed",
  Idle: "Idle",
  Running: "Running",
  Solved: "Solved",
} as const;
export type TimeTrialChallengeState = (typeof TimeTrialChallengeState)[keyof typeof TimeTrialChallengeState];
