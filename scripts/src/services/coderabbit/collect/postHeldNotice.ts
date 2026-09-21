import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { DEVELOP_BRANCH, HELD_MARKER, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { getResult, noop } from "@esposter/shared";

// A held first commit is the residual person's case — the reshaper or the resolver past its attempts — and the
// Run that finds it goes red only once the gate reads `Proceed`: under a rate limit it exits idle so the review
// The limit refused is still asked for. So the fact is written where it is read whatever the gate said: once, on
// The commit itself, beside the attempt markers. Best-effort: a notice lost is re-posted by the next run that
// Holds on the same commit.
export const postHeldNotice = (heldSha: string, isDryRun: boolean, viewerLogin: string): void => {
  const marker = getMarker(HELD_MARKER, heldSha);
  const comments = readCommitComments(heldSha);
  if (comments.some((comment) => checkIsMarked(comment, viewerLogin, marker))) return;

  const body = `${marker}\nHeld: this is the first commit \`${QUEUE_BRANCH}\` owes \`${DEVELOP_BRANCH}\`, and no window can take it — its reshaping under the file cap or its conflict with the tree the fixes built failed past the attempt cap (the comments above say which). Nothing behind it ports until a person splits or rebases it (\`.agents/skills/review-queue/SKILL.md\`).`;
  console.info(`held notice on ${heldSha}`);
  if (!isDryRun) getResult(() => postCommitComment(heldSha, body)).match(noop, console.error);
};
