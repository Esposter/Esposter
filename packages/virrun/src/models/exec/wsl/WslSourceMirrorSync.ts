// A planned source-mirror sync (createWslSourceMirrorSync): the mirror tree's Linux path (the `--overlay-src` lower),
// The mirror lock's Linux path, and the sh script that brings the mirror up to date — "" when the manifest diff shows
// The mirror is already current, so the run prepends nothing and pays no sync at all. A non-empty script is folded
// Into the run's own `wsl.exe` invocation ahead of bwrap (createWslOsBackend) instead of a separate spawn. Every run
// (skip included) then holds a shared flock on lockPath for bwrap's whole duration, so a concurrent same-cwd sync
// (exclusive flock) can never delete or replace mirror files under a live reader.
export interface WslSourceMirrorSync {
  readonly lockPath: string;
  readonly mirrorPath: string;
  readonly script: string;
}
