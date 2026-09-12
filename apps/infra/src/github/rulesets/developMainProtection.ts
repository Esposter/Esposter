import GitHubAdminRepositoryRoleActorId from "#src/github/constants/GitHubAdminRepositoryRoleActorId";
import GitHubRenovateAppActorId from "#src/github/constants/GitHubRenovateAppActorId";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The ruleset protecting develop and main. No human review is required (CodeRabbit stays advisory; GitHub
// Cannot gate a merge on a bot review), and bypass goes to the Admin repository role and the Renovate GitHub
// App, since a ruleset cannot name an individual user the way classic branch protection could.
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
