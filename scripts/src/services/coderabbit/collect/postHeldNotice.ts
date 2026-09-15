import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { DEVELOP_BRANCH, HELD_MARKER, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { getResult, noop } from "@esposter/shared";

// A held first commit is a person's, and the run that finds it goes red only once the gate reads `Proceed` —
// Under a rate limit it exits idle so the review the limit refused is still asked for — so the fact is written
// Where it is read whatever the gate said: once, on the commit itself, like the sync's attempt marker. Every slot
// Until then is spent on the fixes alone, which is the small window nobody meant. Best-effort: a notice lost is
// Re-posted by the next run that holds on the same commit.
export const postHeldNotice = (heldSha: string, isDryRun: boolean, viewerLogin: string): void => {
  const marker = getMarker(HELD_MARKER, heldSha);
  const comments = readEntries<GitHubEntry>(`commits/${heldSha}/comments`);
  if (comments.some((comment) => checkIsMarked(comment, viewerLogin, marker))) return;

  const body = `${marker}\nHeld: this is the first commit \`${QUEUE_BRANCH}\` owes \`${DEVELOP_BRANCH}\`, and no window can take it — it overflows the file cap alone or conflicts with the tree the fixes built (the collector run's log says which). Nothing behind it ports until it is split or rebased (\`.agents/skills/review-queue/SKILL.md\`).`;
  console.info(`held notice on ${heldSha}`);
  if (!isDryRun) getResult(() => postCommitComment(heldSha, body)).match(noop, console.error);
};
