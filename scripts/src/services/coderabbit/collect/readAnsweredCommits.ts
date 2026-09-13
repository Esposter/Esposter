import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { ANSWERS_TRAILER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getAnsweredCommits } from "#src/services/coderabbit/collect/getAnsweredCommits";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// `%x1E` and `%x1F` are git's spelling of the record and field separators `getAnsweredCommits` splits on — the
// Format asks git to emit the control characters rather than passing them through a command line.
const getTrailerFormat = (key: string) => `%(trailers:key=${key},valueonly,separator=%x2c)`;

const FORMAT = ["%H", "%s", getTrailerFormat(ANSWERS_TRAILER), getTrailerFormat(DRAINS_TRAILER)].join("%x1F");

export const readAnsweredCommits = (range: string): AnsweredCommit[] =>
  getAnsweredCommits(runGit(["log", `--format=${FORMAT}%x1E`, range]));
