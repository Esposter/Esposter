export enum CycleOutcomeKind {
  // Mechanical commits reached `main` directly — no review slot spent
  Expressed = "Expressed",
  // Nothing was done: a gate closed, nothing was owed, or the remote moved under the run
  Idle = "Idle",
  // The release pull request merged once its review completed — the push to `main` runs the return stroke
  Merged = "Merged",
  // The release pull request was opened over a `develop` carrying a window no review has read
  Opened = "Opened",
  // A window reached `develop`
  Pushed = "Pushed",
  // A repair of a red `main` reached it — no review slot spent, and the claimed commits behind it go next run
  Repaired = "Repaired",
}
