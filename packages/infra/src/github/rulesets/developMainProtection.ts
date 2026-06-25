import GitHubAdminRepositoryRoleActorId from "@/github/constants/GitHubAdminRepositoryRoleActorId";
import GitHubRenovateAppActorId from "@/github/constants/GitHubRenovateAppActorId";
import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

// Modern ruleset replacing the classic branch protection on develop + main.
// Required_approving_review_count: 0 — no human review required (CodeRabbit stays
// Advisory; GitHub cannot gate merge on a bot review). Bypass via Admin repository
// Role (5) + the Renovate GitHub App (app id 2740) — classic per-user force-push
// Bypassers do not carry over to rulesets.
export const developMainProtection: github.RepositoryRuleset = new github.RepositoryRuleset(
  "developMainProtection",
  {
    bypassActors: [
      {
        actorId: GitHubAdminRepositoryRoleActorId,
        actorType: "RepositoryRole",
        bypassMode: "always",
      },
      {
        actorId: GitHubRenovateAppActorId,
        actorType: "Integration",
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
    name: "develop & main branch protection",
    repository: repository.name,
    rules: {
      deletion: true,
      nonFastForward: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
      },
      // Gate merges on CI. Contexts are the CI.yaml job names; the sharded Coverage matrix
      // Is gated via its single Merge Coverage fan-in job rather than 16 separate contexts.
      // `build-packages` runs via a reusable workflow (uses:), so its check context is
      // prefixed with the caller job id — `build-packages / Build Packages`, not `Build Packages`.
      requiredStatusChecks: {
        requiredChecks: [
          { context: "build-packages / Build Packages" },
          { context: "Build App" },
          { context: "Build Documentation" },
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
