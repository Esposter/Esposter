// What both marker scans leave out: prose names the marker to say how one is written, and this directory plants the
// Violations its test reports. `.claude` is the symlink to `.agents`, which the scans already walk, and reading it
// Throws
export const TODO_EXCLUDED_PATHSPECS: string[] = [
  ":(exclude)*.md",
  ":(exclude)scripts/src/services/sweeps/todos",
  ":(exclude).claude",
];
