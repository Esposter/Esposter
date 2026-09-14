// What one cycle did. Every branch the pass can end on is one of these, so the run's verdict is a value the
// Entry point prints and spends rather than a `process.exit` buried in the middle of it.
export enum CycleOutcomeKind {
  // Mechanical commits reached `main` directly — no review slot spent
  Expressed = "Expressed",
  // `develop` followed a merged `main` by fast-forward — no review slot spent, no pull request open
  FastForwarded = "FastForwarded",
  // Nothing was done: a gate closed, the window is under the fill target, or the remote moved under the run
  Idle = "Idle",
  // The release pull request was opened on a `develop` carrying a window worth its first review
  Opened = "Opened",
  // A window reached `develop`
  Pushed = "Pushed",
}
