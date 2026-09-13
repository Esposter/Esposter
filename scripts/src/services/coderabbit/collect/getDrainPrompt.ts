import type { DrainPromptInput } from "#src/models/coderabbit/collect/DrainPromptInput";

import { ANSWERS_TRAILER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getFindingText } from "#src/services/coderabbit/collect/getFindingText";

// The one step Claude runs. The skill already teaches how a finding is verified, fixed and answered, so the
// Prompt carries the findings as the reviewer wrote them — the drain holds no `gh` to read a thread itself, so
// A title alone would have it re-derive the case the reviewer already made — and the two things the collector
// Needs from the commits: the trailers. It forbids the three things only the collector may do: push, rewrite
// History, and talk to GitHub. The last of those is why a verdict is written to a file rather than posted: the
// Drain reads review text it must not trust, so it runs with no credential that could act on this repository
// (`runDrain`).
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
      `### comment ${commentId.toString()} at ${path}:${line?.toString() ?? "outside the diff"}\n\n${getFindingText(body)}`,
  );
  const bodySection =
    reviewId === undefined
      ? "Body-only findings: none open."
      : `Body-only findings (nitpicks, outside-diff-range) of review ${reviewId.toString()} are open. They have no thread. Check each against the current file. A real one is fixed in a commit carrying the trailer \`${DRAINS_TRAILER}: ${reviewId.toString()}\`. If every one of them is rejected, write one verdict line per finding to \`${verdictPath}\` and the collector posts them as a single pull request comment.`;

  return [
    `You are the review collector's drain step for pull request #${pullRequestNumber} of this repository. You are on the branch that holds the fixes. Work in this checkout only: never push, never switch branches, never rewrite history, never amend, and never run \`gh\` or any other command that writes to GitHub — you hold no credential for it, and the collector posts every reply once the fixes are pushed.`,
    "",
    "Answer every finding below and nothing else. The `coderabbit` skill in `.agents/skills/coderabbit/SKILL.md` and its `references/answering-findings.md` own how: verify against the code before accepting, grep for the repo's convention before taking a suggested diff, and check whether a real finding has a twin the scan stopped short of.",
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
    "When every finding is answered, run the repo's finishing checks over the paths you touched — `pnpm format` at the root, `pnpm typecheck` in the touched package, `pnpm lint:fix` from the repo root, and the touched test suites — and commit any repairs they produce as their own commit. Leave the working tree clean.",
    "",
    "The `ai:coderabbit:feedback` output for the pull request follows, for the body-only buckets and the stated counts:",
    "",
    feedback,
  ].join("\n");
};
