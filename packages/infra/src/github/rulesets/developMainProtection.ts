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
        actorId: 5,
        actorType: "RepositoryRole",
        bypassMode: "always",
      },
      {
        actorId: 2740,
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
    repository: "Esposter",
    rules: {
      deletion: true,
      nonFastForward: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
      },
      // Gate merges on CI. Contexts are the CI.yaml job names; the sharded Coverage matrix
      // Is gated via its single Merge Coverage fan-in job rather than 16 separate contexts.
      requiredStatusChecks: {
        requiredChecks: [
          { context: "Build Packages" },
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
