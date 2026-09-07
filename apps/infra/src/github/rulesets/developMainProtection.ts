import GitHubAdminRepositoryRoleActorId from "#src/github/constants/GitHubAdminRepositoryRoleActorId";
import GitHubRenovateAppActorId from "#src/github/constants/GitHubRenovateAppActorId";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Modern ruleset replacing the classic branch protection on develop + main.
// Required_approving_review_count: 0 — no human review required (CodeRabbit stays
// Advisory; GitHub cannot gate merge on a bot review). Bypass via Admin repository
// Role (5) + the Renovate GitHub App (app id 2740) — classic per-user force-push
// Bypassers do not carry over to rulesets.
// Required status checks deliberately live in developMainStatusChecks instead of here: bypass is granted
// Per ruleset and never per rule, so keeping them in this ruleset would exempt Renovate from CI as the
// Price of exempting it from the pull request requirement.
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
    },
    target: "branch",
  },
  {
    protect: true,
  },
);
