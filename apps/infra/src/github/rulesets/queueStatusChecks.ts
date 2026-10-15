import CoverageShardCount from "#src/github/constants/CoverageShardCount";
import GitHubAdminRepositoryRoleBypassActor from "#src/github/constants/GitHubAdminRepositoryRoleBypassActor";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Required status checks live in their own ruleset so that Renovate is not a bypass actor for them.
// Renovate bypasses oneWriterRefs so its merges can land on ai/queue, but its updates must still land green.
// Bypass is granted per ruleset and never per rule, so the two cannot share one.
// The up-to-date requirement is off: ai/queue moves every few minutes, so a requirement that a PR be current
// With it would starve a Renovate PR. A Renovate PR merges once its own head is green.
// The sharded Coverage matrix is required shard by shard as well as through its `Merge Coverage` fan-in.
// GitHub scores a skipped required check as passing, so a fan-in job that a failing shard can skip is not a
// Gate at all — it merges a red suite. Coverage-merge therefore runs under `!cancelled()` and fails on any
// Failed dependency; the per-shard contexts stay as the belt to its braces, since they are what holds if that
// Job is ever edited back into a skip.
export const queueStatusChecks: github.RepositoryRuleset = new github.RepositoryRuleset(
  "queueStatusChecks",
  {
    bypassActors: [GitHubAdminRepositoryRoleBypassActor],
    conditions: { refName: { excludes: [], includes: ["refs/heads/ai/queue"] } },
    enforcement: "active",
    name: "ai/queue status checks",
    repository: repository.name,
    rules: {
      // Contexts are the CI.yaml job names — the `check` matrix contributes one per entry — except
      // `build-packages`, which runs via a reusable workflow (uses:) and so reports prefixed with the caller job
      // Id — `build-packages / Build Packages`.
      requiredStatusChecks: {
        requiredChecks: [
          { context: "build-packages / Build Packages" },
          { context: "Build App" },
          ...Array.from({ length: CoverageShardCount }, (_value, shardIndex) => ({
            context: `Coverage (${shardIndex + 1})`,
          })),
          { context: "Merge Coverage" },
          { context: "Lint" },
          { context: "Format" },
          { context: "Typecheck" },
        ],
        strictRequiredStatusChecksPolicy: false,
      },
    },
    target: "branch",
  },
  { protect: true },
);
