// How one leaf of a record differs from the published one: present only in the new record, only in the published one,
// Or in both with another value
export enum GameDataChangeKind {
  Added = "added",
  Changed = "changed",
  Removed = "removed",
}
