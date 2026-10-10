// What a publish did: nothing, because the lock already names it; the records a dry run would store; or the
// Publication, stored in both accounts, whose lock is still to be committed
export enum GameDataPublishOutcome {
  DryRun = "dryRun",
  Published = "published",
  Unchanged = "unchanged",
}
