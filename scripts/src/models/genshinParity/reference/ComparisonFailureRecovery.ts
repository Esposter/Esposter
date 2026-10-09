// What a failed comparison leaves `compare --all` to do before the next reference: a page, context or browser that closed
// Is relaunched for it, while any other failure is the reference's own and leaves the browser it ran in
export enum ComparisonFailureRecovery {
  MissingInput = "missing input",
  RelaunchAndContinue = "relaunch and continue",
}
