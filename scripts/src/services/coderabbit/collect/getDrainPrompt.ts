import type { DrainPromptInput } from "#src/models/coderabbit/collect/DrainPromptInput";

import {
  ANSWERS_TRAILER,
  DRAINS_TRAILER,
  FINISHING_CHECKS_INSTRUCTION,
  SESSION_DENIALS,
} from "#src/services/coderabbit/collect/constants";
import { getFindingText } from "#src/services/coderabbit/collect/getFindingText";

// The skills teach how a finding is verified, fixed and answered; the prompt carries the findings as the reviewer
// Wrote them (the drain holds no `gh`), the trailers the collector needs, and the three things only the collector
// May do — push, rewrite history, talk to GitHub. A verdict is a file rather than a post for the same reason.
export const getDrainPrompt = ({
  feedback,
  openThreads,
  pullRequest,
  rejectionsPath,
  reviewId,
  verdictPath,
}: DrainPromptInput): string => {
  const pullRequestNumber = pullRequest.toString();
  const threadSections = openThreads.map(
    ({ body, commentId, line, path }) =>
      `### comment ${commentId} at ${path}:${line?.toString() ?? "outside the diff"}\n\n${getFindingText(body)}`,
  );
  const bodySection =
    reviewId === undefined
      ? "Body-only findings: none open."
      : `Body-only findings (nitpicks, outside-diff-range) of review ${reviewId} are open. They have no thread. Check each against the current file. A real one is fixed in a commit carrying the trailer \`${DRAINS_TRAILER}: ${reviewId}\`. For each one you reject, append one verdict line \`<what it named> <the evidence that makes it invalid>\` to \`${verdictPath}\` — the collector posts them as one pull request comment, whether or not any other was fixed.`;

  return [
    `You are the review collector's drain step for pull request #${pullRequestNumber} of this repository. You are on the branch that holds the fixes. ${SESSION_DENIALS}`,
    "",
    "Answer every finding below and nothing else. The `coderabbit` skill in `.agents/skills/coderabbit/SKILL.md` and its `references/answering-findings.md` own how: verify against the code before accepting, grep for the repo's convention before taking a suggested diff, and check whether a real finding has a twin the scan stopped short of. A finding that argues against a decision the code's own comment, a docs page or a skill states with its reason is rejected unless you refute that reason with a fact you verified here — `.agents/skills/code-review/SKILL.md`, \"The written record wins\"; an argument that merely sounds right, a security-flavoured one most of all, is not a fact. This is a delegated fix round, so `.agents/skills/code-review/references/fixing-findings.md` owns the order of work — the root cause over the symptom, every call site the fix converges, and the docs page or skill the change leaves stale.",
    "",
    "## Open inline findings",
    "",
    ...(threadSections.length > 0 ? threadSections : ["none"]),
    "",
    bodySection,
    "",
    `For each inline finding you accept: fix it and commit. The commit message carries one trailer line per thread it answers, \`${
      ANSWERS_TRAILER
    }: <comment id>\`, added with \`git commit --trailer "${
      ANSWERS_TRAILER
    }: <comment id>"\`. One commit may answer several findings.`,
    `For each inline finding you reject: append one line \`<comment id> <the evidence that makes it invalid>\` to \`${rejectionsPath}\`. A rejection needs no commit.`,
    "",
    `When every finding is answered: ${FINISHING_CHECKS_INSTRUCTION} Leave the working tree clean.`,
    "",
    "The `ai:coderabbit:feedback` output for the pull request follows, for the body-only buckets and the stated counts:",
    "",
    feedback,
  ].join("\n");
};
