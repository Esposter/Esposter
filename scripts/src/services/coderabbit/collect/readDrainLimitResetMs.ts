import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { DRAIN_LIMITED_MARKER } from "#src/services/coderabbit/collect/constants";

// The marker carries the instant as a plain ISO string, so a person reading the pull request sees when the
// Collector will pick the drain up again
const RESET_PATTERN = /until (?<instant>\S+)/u;

// The limit the last run hit, if it has not lifted. A run every queue push would otherwise download Claude Code
// And be refused all over again, once per push, for the hours the limit lasts — while each refusal counted
// Against the quarantine budget and painted the collector's check red for something no fix would change.
export const readDrainLimitResetMs = (comments: GitHubEntry[], viewerLogin: string): number | undefined => {
  const comment = comments.findLast(
    ({ body, user }) => user.login === viewerLogin && body.includes(DRAIN_LIMITED_MARKER),
  );
  const instant = comment && RESET_PATTERN.exec(comment.body)?.groups?.instant;
  if (!instant) return undefined;
  const resetAtMs = Date.parse(instant);
  return Number.isNaN(resetAtMs) ? undefined : resetAtMs;
};
