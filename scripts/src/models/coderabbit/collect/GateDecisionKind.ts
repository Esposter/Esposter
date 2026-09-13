export enum GateDecisionKind {
  // Nothing to do this run — a review is running, or the last push is not yet reviewed
  Exit = "Exit",
  // A state the gates do not recognise — a person looks rather than the collector guessing
  Fail = "Fail",
  // A rate-limited status with a stale body: only a retrigger says whether the checkpoint covers the head
  Probe = "Probe",
  Proceed = "Proceed",
}
