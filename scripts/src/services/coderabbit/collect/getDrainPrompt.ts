import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";

import { ANSWERS_TRAILER, DRAINS_MARKER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";

// The one step Claude runs. The skill already teaches how a finding is verified, fixed and answered, so the
// Prompt names the findings and the two things the collector needs from the commits — the trailers — and
// Forbids the two things only the collector may do: push, and rewrite history.
export const getDrainPrompt = ({ feedback, openThreads, pullRequest, reviewId }: DrainInput): string => {
  const pullRequestNumber = pullRequest.toString();
  const threadLines = openThreads.map(
    ({ body, commentId, line, path }) =>
      `- comment ${commentId.toString()} at ${path}:${line?.toString() ?? "outside the diff"}\n  ${body.split("\n").find((entry) => entry.startsWith("**")) ?? body.split("\n")[0] ?? ""}`,
  );
  const bodySection =
    reviewId === undefined
      ? "Body-only findings: none open."
      : `Body-only findings (nitpicks, outside-diff-range) of review ${reviewId.toString()} are open. They have no thread. Check each against the current file. A real one is fixed in a commit carrying the trailer \`${DRAINS_TRAILER}: ${reviewId.toString()}\`. If every one of them is rejected, post exactly one pull request comment whose first line is \`<!-- ${DRAINS_MARKER} review:${reviewId.toString()} -->\` followed by one verdict line per finding.`;

  return [
    `You are the review collector's drain step for pull request #${pullRequestNumber} of this repository. You are on the branch that holds the fixes. Work in this checkout only: never push, never switch branches, never rewrite history, never amend.`,
    "",
    "Answer every finding below and nothing else. The `coderabbit` skill in `.agents/skills/coderabbit/SKILL.md` and its `references/answering-findings.md` own how: verify against the code before accepting, grep for the repo's convention before taking a suggested diff, and check whether a real finding has a twin the scan stopped short of.",
    "",
    "Open inline findings:",
    ...(threadLines.length > 0 ? threadLines : ["- none"]),
    "",
    bodySection,
    "",
    `For each inline finding you accept: fix it and commit. The commit message carries one trailer line per thread it answers, \`${
      ANSWERS_TRAILER
    }: <comment id>\`, added with \`git commit --trailer "${
      ANSWERS_TRAILER
    }: <comment id>"\`. One commit may answer several findings. Do not reply to an accepted finding — the collector replies once the commit is pushed.`,
    `For each inline finding you reject: reply now with \`gh api repos/{owner}/{repo}/pulls/${pullRequestNumber}/comments/<comment id>/replies -f body="Not a real issue, no change — <evidence>"\`. A rejection needs no commit.`,
    "",
    "When every finding is answered, run the repo's finishing checks over the paths you touched — `pnpm format` at the root, `pnpm typecheck` in the touched package, `pnpm lint:fix` from the repo root, and the touched test suites — and commit any repairs they produce as their own commit. Leave the working tree clean.",
    "",
    "The `ai:coderabbit:feedback` output for the pull request follows, for the body-only buckets and the stated counts:",
    "",
    feedback,
  ].join("\n");
};
