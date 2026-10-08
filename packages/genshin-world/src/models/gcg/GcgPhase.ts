// Where a duel is: the preparation before its first round, the roll phase, the action phase where both sides take turns,
// And the end once a side is defeated or the duel concedes
export enum GcgPhase {
  Action = "Action",
  Ended = "Ended",
  Preparation = "Preparation",
  Roll = "Roll",
}
