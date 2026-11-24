import GitHubAdminRepositoryRoleBypassActor from "#src/github/constants/GitHubAdminRepositoryRoleBypassActor";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// `main` is the reviewed prefix of `ai/queue`, moved by the review workflow's fast-forward push.
// The nightly Release's version commit moves it too, as the Admin repository role through `REVIEW_COLLECTOR_TOKEN`.
// The release then starts a review run, which merges that commit back into `ai/queue`.
// Nothing else writes it: no pull request targets `main`, so there is no pull request rule.
// Renovate, which lands on `ai/queue`, is no bypass actor.
// A Ruleset cannot name an individual user, so the Admin role is the only bypass.
// `deletion` and `nonFastForward` keep `main`'s history whole.
// Required status checks live in queueStatusChecks, not here: bypass is granted per ruleset and never per rule.
export const mainProtection: github.RepositoryRuleset = new github.RepositoryRuleset(
  "mainProtection",
  {
    bypassActors: [GitHubAdminRepositoryRoleBypassActor],
    conditions: { refName: { excludes: [], includes: ["refs/heads/main"] } },
    enforcement: "active",
    name: "main branch protection",
    repository: repository.name,
    rules: { deletion: true, nonFastForward: true, update: true },
    target: "branch",
  },
  { protect: true },
);
