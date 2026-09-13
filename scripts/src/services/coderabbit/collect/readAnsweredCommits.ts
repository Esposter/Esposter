import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { getAnsweredCommits } from "#src/services/coderabbit/collect/getAnsweredCommits";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// `%x1E` and `%x1F` are git's spelling of the record and field separators `getAnsweredCommits` splits on — the
// Format asks git to emit the control characters rather than passing them through a command line. The raw body
// Is asked for rather than `%(trailers:key=…)`, because git reads trailers out of the last contiguous block
// Alone and these commits end with an attribution line of their own (`getAnsweredCommits`).
const FORMAT = ["%H", "%s", "%B"].join("%x1F");

export const readAnsweredCommits = (range: string): AnsweredCommit[] =>
  getAnsweredCommits(runGit(["log", `--format=${FORMAT}%x1E`, range]));
