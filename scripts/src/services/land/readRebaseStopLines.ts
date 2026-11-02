import { readRebaseConflicts } from "#src/services/land/readRebaseConflicts";

// The lines a landing prints when its pull stopped on a rebase: each path still unmerged, then the command that finishes
// The rebase. Once every conflict is staged no path is unmerged, so the command is the one line the author is given
export const readRebaseStopLines = (cwd?: string): string[] => [
  ...readRebaseConflicts(cwd).map((path) => `conflict ${path}`),
  "rebase in progress: git rebase --continue once its conflicts are staged, or git rebase --abort to drop it",
];
