import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { DRAIN_LIMITED_MARKER } from "#src/services/coderabbit/collect/constants";

// The marker carries the instant as a plain ISO string, so a person reading the pull request sees when the
// Collector will pick the drain up again
const RESET_PATTERN = /until (?<instant>\S+)/u;

// The limit the last run hit, if it has not lifted — otherwise every queue push would download Claude Code to
// Be refused again, each refusal counting against the quarantine budget
export const readDrainLimitResetMs = (comments: GitHubEntry[], viewerLogin: string): number | undefined => {
  const comment = comments.findLast((issueComment) => checkIsMarked(issueComment, viewerLogin, DRAIN_LIMITED_MARKER));
  const instant = comment && RESET_PATTERN.exec(comment.body)?.groups?.instant;
  if (!instant) return undefined;
  const resetAtMs = Date.parse(instant);
  return Number.isNaN(resetAtMs) ? undefined : resetAtMs;
};
