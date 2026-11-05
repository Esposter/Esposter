// What a publish did: nothing, because a dry run finds the lock already names the publication, or because a publication
// That stores no object leaves the lock as it is; the records a dry run would store; or the publication, stored in both
// Accounts, whose lock is still to be committed
export enum GameDataPublishOutcome {
  DryRun = "dryRun",
  Empty = "empty",
  Published = "published",
  Unchanged = "unchanged",
}
