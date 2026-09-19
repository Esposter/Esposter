// The tracker's five triage labels, whose strings are the role names the skills speak in. The prose that owns
// Them is `.agents/triage-labels.md`, and the colocated test holds this enum to that table and to the labels
// The repository actually declares.
export enum TriageLabel {
  NeedsInfo = "needs-info",
  NeedsTriage = "needs-triage",
  ReadyForAgent = "ready-for-agent",
  ReadyForHuman = "ready-for-human",
  WontFix = "wontfix",
}
