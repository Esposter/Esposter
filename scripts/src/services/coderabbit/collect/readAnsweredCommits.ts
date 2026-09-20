import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { ANSWERED_COMMIT_FORMAT } from "#src/services/coderabbit/collect/constants";
import { getAnsweredCommits } from "#src/services/coderabbit/collect/getAnsweredCommits";
import { runGit } from "#src/services/shared/runGit";

// A range, or `--no-walk` and the shas to read alone
export const readAnsweredCommits = (revisions: string[], cwd?: string): AnsweredCommit[] =>
  getAnsweredCommits(runGit(["log", `--format=${ANSWERED_COMMIT_FORMAT}`, ...revisions], cwd));
