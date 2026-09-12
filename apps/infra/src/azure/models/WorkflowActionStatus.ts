// The predecessor statuses a workflow action's `runAfter` names; the workflow definition language keeps a timed-out
// Action apart from a failed one, so a successor that should follow either has to name both
export enum WorkflowActionStatus {
  Failed = "Failed",
  TimedOut = "TimedOut",
}
