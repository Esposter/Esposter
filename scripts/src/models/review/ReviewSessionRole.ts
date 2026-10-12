// The three sessions a review runs: a read-only reviewer per batch, the fixer that may edit and commit one issue's findings,
// And the settler that settles an issue the fixer left open
export enum ReviewSessionRole {
  Fixer = "fixer",
  Reviewer = "reviewer",
  Settler = "settler",
}
