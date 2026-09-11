import type { GitHubReview } from "#src/coderabbit/models/GitHubReview";

import { getPullRequestArgument } from "#src/coderabbit/services/getPullRequestArgument";
import { readBotEntries } from "#src/coderabbit/services/readBotEntries";
import { runGh } from "#src/coderabbit/services/runGh";
import { getLastReviewedSha } from "#src/coderabbit/window/getLastReviewedSha";
import { REPOSITORY_ROOT } from "#src/services/constants";
import { parseMachineJson } from "#src/services/parseMachineJson";
import { execFileSync } from "node:child_process";

interface PullRequestBranches {
  baseRefName: string;
  headRefName: string;
}

// Every count is against the repository root: with `diff.relative` set, a `git diff` run from this package's own
// Directory answers about `scripts/` alone — a short, clean-looking number.
const runGit = (args: string[]): string => execFileSync("git", args, { cwd: REPOSITORY_ROOT, encoding: "utf8" });
const getFileCount = (range: string): number =>
  runGit(["diff", "--name-only", range]).split("\n").filter(Boolean).length;

const pullRequest = getPullRequestArgument();
const { baseRefName, headRefName } = parseMachineJson<PullRequestBranches>(
  runGh(["pr", "view", pullRequest.toString(), "--json", "baseRefName,headRefName"]),
);
const bodies = readBotEntries<GitHubReview>(`pulls/${pullRequest.toString()}/reviews`).map(({ body }) => body);
const lastReviewed = getLastReviewedSha(bodies);
// No body naming a range is the first review, where the frontier is the merge base and the window is the
// Cumulative diff. It never means zero, which is how an over-cap first window gets pushed as a small one.
const frontier = lastReviewed ?? runGit(["merge-base", `origin/${baseRefName}`, "HEAD"]).trim();
if (lastReviewed === undefined)
  console.info("no review names a range — first review, so the frontier is the merge base");

console.info(`last reviewed:     ${frontier}`);
// `..origin/<head>` omits exactly the commits a push is about to add, so it answers "is a previous window still
// Unreviewed" and nothing else. `..HEAD` is the one to size a push against.
console.info(`pushed+unreviewed: ${getFileCount(`${frontier}..origin/${headRefName}`).toString()}`);
console.info(`next push adds to: ${getFileCount(`${frontier}..HEAD`).toString()}`);
