import type { GitHubReview } from "#src/models/coderabbit/GitHubReview";
import type { PullRequestBranches } from "#src/models/coderabbit/window/PullRequestBranches";

import { getPullRequestArgument } from "#src/services/coderabbit/getPullRequestArgument";
import { readBotEntries } from "#src/services/coderabbit/readBotEntries";
import { runGh } from "#src/services/coderabbit/runGh";
import { getFileCount } from "#src/services/coderabbit/window/getFileCount";
import { getLastReviewedSha } from "#src/services/coderabbit/window/getLastReviewedSha";
import { parseMachineJson } from "#src/services/parseMachineJson";
import { runGit } from "#src/services/runGit";

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
