import GitHubAdminRepositoryRoleBypassActor from "#src/github/constants/GitHubAdminRepositoryRoleBypassActor";
import GitHubRenovateAppBypassActor from "#src/github/constants/GitHubRenovateAppBypassActor";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The ruleset protecting develop and main: updated only by the Admin repository role and the Renovate GitHub
// App (a ruleset cannot name an individual user the way classic branch protection could), so the collector's
// Window push and release merge and Renovate's branch automerge are the only writers, and no other pull request
// Is mergeable — one against main would spend CodeRabbit's hourly slot on arrival, the budget the release lives
// On. No approving review is required: CodeRabbit stays advisory, GitHub cannot gate a merge on a bot review, and
// Nobody but a bypass actor can merge. A release merges as a merge commit only, so develop stays an ancestor of
// Main and the return stroke fast-forwards it.
// Required status checks deliberately live in developMainStatusChecks instead of here: bypass is granted
// Per ruleset and never per rule, so keeping them in this ruleset would exempt Renovate from CI as the
// Price of exempting it from the pull request requirement.
export const developMainProtection: github.RepositoryRuleset = new github.RepositoryRuleset(
  "developMainProtection",
  {
    bypassActors: [GitHubAdminRepositoryRoleBypassActor, GitHubRenovateAppBypassActor],
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
        allowedMergeMethods: ["merge"],
        requiredApprovingReviewCount: 0,
      },
      update: true,
    },
    target: "branch",
  },
  { protect: true },
);
