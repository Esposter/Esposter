// The tracker's five triage labels, whose strings are the role names the skills speak in. The prose that owns
// them is `.agents/triage-labels.md`, and `constants.test.ts` holds this enum to that table.
export enum TriageLabel {
  NeedsInfo = "needs-info",
  NeedsTriage = "needs-triage",
  ReadyForAgent = "ready-for-agent",
  ReadyForHuman = "ready-for-human",
  WontFix = "wontfix",
}
