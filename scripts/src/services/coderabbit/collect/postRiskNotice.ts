import type { RiskNoticeInput } from "#src/models/coderabbit/collect/RiskNoticeInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { MERGEABLE_RISK_LEVEL, RISK_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { getResult, noop } from "@esposter/shared";

// A clean review the bot rates above the least risk is a release only a person makes, and nothing else in the
// Cycle says so: the run goes on to port and exits green, which reads as a stall from the pull request. One
// Comment per head, carrying the level, is the difference between a pause a person chose and one nobody noticed.
export const postRiskNotice = ({
  developSha,
  isDryRun,
  issueComments,
  level,
  pullRequest,
  viewerLogin,
}: RiskNoticeInput): void => {
  const marker = getMarker(RISK_MARKER, developSha);
  if (issueComments.some((comment) => checkIsMarked(comment, viewerLogin, marker))) return;

  const body = `${marker}\nThe review at ${developSha} left nothing open, and the bot rates the merge risk _${level}_ — above _${MERGEABLE_RISK_LEVEL}_, the one level the collector merges on. A person merges this pull request, or closes it to pause; the collector keeps porting meanwhile, and a later review may restate the level.`;
  console.info(`merge risk ${level} at ${developSha} — a person merges`);
  if (!isDryRun) getResult(() => postComment(pullRequest, body)).match(noop, console.error);
};
