// What the review's record step did with the bundle-size record of its checkout's commit
export interface BundleSizeRecordOutcome {
  // Whether the committed record already matched the build, so nothing was written
  isCurrent: boolean;
  // Whether a written record landed on the queue. One that did not is left to the next run, and the run goes on
  isPushed: boolean;
  // The sentences the run's summary gives for the record, and the commit body's rows, one line each
  lines: string[];
}
