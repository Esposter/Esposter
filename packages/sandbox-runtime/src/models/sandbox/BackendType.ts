export enum BackendType {
  // Pick the fastest backend the host supports. Resolves to Native today.
  Auto = "auto",
  // Run the command directly on the host with no virtualization.
  Native = "native",
  // Run recognised pure-JS node invocations in the current process against the RAM filesystem; fall
  // Back to Native for anything it can't run in-process, so the result always matches baseline.
  Vfs = "vfs",
}
