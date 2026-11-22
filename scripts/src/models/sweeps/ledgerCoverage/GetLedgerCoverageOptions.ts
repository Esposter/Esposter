// What a ledger's coverage reads beyond its trailers
export interface GetLedgerCoverageOptions {
  // A unit that reads as open whatever its trailers say, for a ledger whose rule a trailer cannot settle alone
  checkIsForcedOpen?: ((unit: string) => boolean) | undefined;
  // The area a unit sits in, which a whole-area reopen reads: a unit no area names reads as in none
  readUnitArea?: ((unit: string) => string | undefined) | undefined;
  // The repository paths a commit has touched since the date, read only once a clean sample needs them
  readChangedPaths?: ((since: string) => readonly string[]) | undefined;
}
