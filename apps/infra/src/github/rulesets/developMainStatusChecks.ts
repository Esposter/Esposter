import CoverageShardCount from "#src/github/constants/CoverageShardCount";
import GitHubAdminRepositoryRoleActorId from "#src/github/constants/GitHubAdminRepositoryRoleActorId";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";
// Required status checks live in their own ruleset so that Renovate is not a bypass actor for them.
// Renovate bypasses the pull request requirement in developMainProtection so branch automerge can push
// Straight to the base branch, but its updates must still land green. Bypass is granted per ruleset and
// Never per rule, so the two cannot share one.
// The sharded Coverage matrix is required shard by shard as well as through its `Merge Coverage` fan-in.
// GitHub scores a skipped required check as passing, so a fan-in job that a failing shard can skip is not a
// Gate at all — it merges a red suite. Coverage-merge therefore runs under `!cancelled()` and fails on any
// Failed dependency; the per-shard contexts stay as the belt to its braces, since they are what holds if that
// Job is ever edited back into a skip.
export const developMainStatusChecks: github.RepositoryRuleset = new github.RepositoryRuleset(
  "developMainStatusChecks",
  {
    bypassActors: [
      {
        actorId: GitHubAdminRepositoryRoleActorId,
        actorType: "RepositoryRole",
        bypassMode: "always",
      },
    ],
    conditions: {
      refName: {
        excludes: [],
        includes: ["refs/heads/develop", "refs/heads/main"],
      },
    },
    enforcement: "active",
    name: "develop & main status checks",
    repository: repository.name,
    rules: {
      // Contexts are the CI.yaml job names, except `build-packages`, which runs via a reusable workflow
      // (uses:) and so reports prefixed with the caller job id — `build-packages / Build Packages`.
      requiredStatusChecks: {
        requiredChecks: [
          { context: "build-packages / Build Packages" },
          { context: "Build App" },
          // @TODO: Restore when the `build-docs` job in .github/workflows/CI.yaml is uncommented — a context no
          // Job reports is never satisfied, so leaving it required blocks every merge.
          // { context: "Build Documentation" },
          ...Array.from({ length: CoverageShardCount }, (_, shardIndex) => ({
            context: `Coverage (${shardIndex + 1})`,
          })),
          { context: "Merge Coverage" },
          { context: "Lint" },
          { context: "Format" },
          { context: "Typecheck" },
        ],
        strictRequiredStatusChecksPolicy: true,
      },
    },
    target: "branch",
  },
  {
    protect: true,
  },
);
