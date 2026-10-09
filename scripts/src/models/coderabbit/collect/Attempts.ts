export interface Attempts {
  // How many attempts had already been made, which is what the step compares against the cap
  attempts: number;
  // Records this attempt as made without failing, under the marker the count reads, with a note in place of the
  // Failure's sentence: a repair that landed counts as an attempt, so one that leaves the same red is not paid for anew
  recordAttempt: (note: string) => void;
  // Records this attempt's failure where the count was read and under the marker it counted (`getAttemptFailure`)
  recordFailure: (task: string, detail?: string) => void;
}
