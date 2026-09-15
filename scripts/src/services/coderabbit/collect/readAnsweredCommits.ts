import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { ANSWERED_COMMIT_FORMAT } from "#src/services/coderabbit/collect/constants";
import { getAnsweredCommits } from "#src/services/coderabbit/collect/getAnsweredCommits";
import { runGit } from "#src/services/coderabbit/shared/runGit";

export const readAnsweredCommits = (range: string, cwd?: string): AnsweredCommit[] =>
  getAnsweredCommits(runGit(["log", `--format=${ANSWERED_COMMIT_FORMAT}`, range], cwd));
