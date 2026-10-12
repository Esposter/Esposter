// The two sessions a review runs: a read-only reviewer per batch, and the one fixer that may edit and commit
export enum ReviewSessionRole {
  Fixer = "fixer",
  Reviewer = "reviewer",
}
