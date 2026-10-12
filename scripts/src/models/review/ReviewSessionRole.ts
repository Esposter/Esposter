// The two sessions a review runs: a read-only reviewer per batch, and the fixer that may edit and commit, one per window
export enum ReviewSessionRole {
  Fixer = "fixer",
  Reviewer = "reviewer",
}
