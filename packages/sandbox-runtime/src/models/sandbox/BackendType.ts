export enum BackendType {
  // Pick the fastest backend the host supports. Resolves to Native today.
  Auto = "auto",
  // Run the command directly on the host with no virtualization.
  Native = "native",
}
