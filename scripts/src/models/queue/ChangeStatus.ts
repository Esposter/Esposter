// The status letters `git diff --name-status` writes, for the three a landing reads. A rename is not among them, since the
// Diff is read with `--no-renames`, so a moved file is one deletion and one addition
export enum ChangeStatus {
  Added = "A",
  Deleted = "D",
  Modified = "M",
}
