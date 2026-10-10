import type { DeferFindingsInput } from "#src/models/coderabbit/collect/DeferFindingsInput";

import {
  ANSWERS_TRAILER,
  DRAIN_DEFERRED_MARKER,
  DRAINS_TRAILER,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { getDrainsVerdictBody } from "#src/services/coderabbit/collect/getDrainsVerdictBody";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postReply } from "#src/services/coderabbit/collect/postReply";
import { readPullRequestHeadSha } from "#src/services/coderabbit/collect/readPullRequestHeadSha";
import { readRepository } from "#src/services/coderabbit/shared/readRepository";
import { getResult, noop } from "@esposter/shared";

// A drain past its cap answers every finding it still holds by deferring it, so the walk goes on. The issue goes first
// And is thrown on: a run that could not open it leaves every finding open for the next one, and the marker keeps it to
// One issue. The marker is the window's head rather than the review, since each reply the bot posts in a thread is a
// Review of its own, and a key on the newest one would open a second issue for the same window. The replies and the
// Verdict that close the findings are best-effort, and one that did not land is deferred again next run.
export const deferFindings = ({
  attempts,
  cause,
  isDryRun,
  openThreads,
  pullRequest,
  reviewId,
  viewerLogin,
}: DeferFindingsInput): void => {
  const { name, owner } = readRepository();
  const pullRequestUrl = `https://github.com/${owner.login}/${name}/pull/${pullRequest}`;
  openCollectorIssue({
    body: [
      `The drain of #${pullRequest} failed ${attempts} times, so its open findings are deferred and the walk went on: ${cause}`,
      "",
      ...openThreads.map(({ commentId, path }) => `- ${pullRequestUrl}#discussion_r${commentId} — \`${path}\``),
      ...(reviewId === undefined ? [] : [`- ${pullRequestUrl}#pullrequestreview-${reviewId} — body-only findings`]),
      "",
      `Answer each with a commit on \`${QUEUE_BRANCH}\` carrying \`${ANSWERS_TRAILER}: <comment id>\`, or \`${DRAINS_TRAILER}: <review id>\` for the body-only findings, then close this issue.`,
    ].join("\n"),
    isDryRun,
    marker: getMarker(DRAIN_DEFERRED_MARKER, readPullRequestHeadSha(pullRequest)),
    title: `Deferred findings of #${pullRequest}`,
    viewerLogin,
  });

  const reply = `Deferred after ${attempts} attempts — ${cause}`;
  for (const { commentId } of openThreads) {
    console.info(`reply ${commentId}: ${reply}`);
    if (!isDryRun) getResult(() => postReply(pullRequest, commentId, reply)).match(noop, console.error);
  }
  if (reviewId === undefined) return;

  const body = getDrainsVerdictBody(reviewId, "deferred", [`- after ${attempts} attempts — ${cause}`]);
  console.info(`verdict comment for review ${reviewId}`);
  if (!isDryRun) getResult(() => postComment(pullRequest, body)).match(noop, console.error);
};
