import GitHubAdminRepositoryRoleActorId from "@/github/constants/GitHubAdminRepositoryRoleActorId";
import { repository } from "@/github/repository";
import * as github from "@pulumi/github";
// Must match the length of the `coverage` job's `matrix.shard` in .github/workflows/CI.yaml — each shard
// Publishes its own `Coverage (n)` check context, and only contexts listed here are enforced.
const coverageShardCount = 16;
// Required status checks live in their own ruleset so that Renovate is not a bypass actor for them.
// Renovate bypasses the pull request requirement in developMainProtection so branch automerge can push
// Straight to the base branch, but its updates must still land green. Bypass is granted per ruleset and
// Never per rule, so the two cannot share one.
// The sharded Coverage matrix is required shard by shard rather than through its `Merge Coverage` fan-in:
// Coverage-merge has no `if: always()`, so a failing shard leaves it skipped, and GitHub scores a skipped
// Required check as passing — which is how dependency updates merged with a red test suite.
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
          { context: "Build Documentation" },
          ...Array.from({ length: coverageShardCount }, (_, shardIndex) => ({
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
