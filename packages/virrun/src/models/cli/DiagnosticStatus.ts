// The outcome of a single `virrun doctor` prerequisite check.
export enum DiagnosticStatus {
  // The prerequisite is absent or unusable — the check's `fix` explains the remedy.
  Missing = "missing",
  // The check does not apply on this platform (e.g. the WSL node check off win32).
  NotApplicable = "n/a",
  // The prerequisite is present and usable.
  Ok = "ok",
}
