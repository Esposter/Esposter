// A planned source-mirror sync (createWslSourceMirrorSync): the mirror tree's Linux path (the `--overlay-src` lower)
// And the sh script that brings the mirror up to date — "" when the manifest diff shows the mirror is already current,
// So the run prepends nothing and pays no sync at all. A non-empty script is folded into the run's own `wsl.exe`
// Invocation ahead of bwrap (createWslOsBackend) instead of a separate spawn.
export interface WslSourceMirrorSync {
  readonly mirrorPath: string;
  readonly script: string;
}
