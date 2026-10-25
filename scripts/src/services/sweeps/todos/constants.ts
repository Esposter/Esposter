import { CLAUDE_PATHSPEC_EXCLUDE } from "#src/services/sweeps/constants";

// What both marker scans leave out: prose names the marker to say how one is written, and this directory plants the
// Violations its test reports
export const TODO_EXCLUDED_PATHSPECS: string[] = [
  ":(exclude)*.md",
  ":(exclude)scripts/src/services/sweeps/todos",
  CLAUDE_PATHSPEC_EXCLUDE,
];
