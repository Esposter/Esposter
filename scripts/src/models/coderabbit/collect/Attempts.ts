export interface Attempts {
  // How many attempts had already failed, which is what the step compares against the cap
  attempts: number;
  // Records this attempt's failure where the count was read and under the marker it counted (`getAttemptFailure`)
  recordFailure: (task: string, detail?: string) => void;
}
