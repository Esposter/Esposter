import { CLAUDE_PATHSPEC_EXCLUDE } from "#src/services/sweeps/constants";

// What both marker scans leave out: prose names the marker to say how one is written, and this directory plants the
// Violations its test reports
export const TODO_EXCLUDED_PATHSPECS: string[] = [
  ":(exclude)*.md",
  ":(exclude)scripts/src/services/sweeps/todos",
  CLAUDE_PATHSPEC_EXCLUDE,
];
// The marker a workaround is written under: the grep finds the lines holding it, and the regex reads the link after it
export const TODO_MARKER = "@TODO";
// The links GitHub's own record answers for, read in one request by the report
export const GITHUB_URL_PREFIX = "https://github.com/";
