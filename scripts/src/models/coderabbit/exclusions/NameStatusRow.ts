// One row of `git diff --name-status -M`, read to the path it ends at
export interface NameStatusRow {
  // The new path of a rename, the one path of anything else — what `--name-only` would print for the row
  path: string;
  // The path a rename came from, absent on a file that stayed put
  renamedFrom?: string;
  // The status letter, carrying git's similarity score on a rename: `R100`, `R085`, `M`, `A`, `D`
  status: string;
}
