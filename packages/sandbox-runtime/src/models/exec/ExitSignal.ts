// Thrown by the in-process runner's process.exit override so a workload calling process.exit(n)
// Unwinds back to the runner carrying its code, instead of killing the host process.
export class ExitSignal {
  constructor(readonly code: number) {}
}
