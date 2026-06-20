import GitHubAdminRepositoryRoleActorId from "@/github/constants/GitHubAdminRepositoryRoleActorId";
import GitHubRenovateAppActorId from "@/github/constants/GitHubRenovateAppActorId";
import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

// Replaces the classic `*` wildcard branch protection's "restrict who can push" list,
// Whose real intent was to restrict who may create branches. Rulesets cannot bypass by
// Individual user (only role/team/app), so the equivalent is restricting creation across
// All refs to the Admin repository role (5) + the Renovate GitHub App (app id 2740), which
// Must keep opening its dependency-update branches. `creation: true` only allows bypass
// Actors to create matching refs; existing branches and pushes to them are unaffected.
export const branchCreationRestriction: github.RepositoryRuleset = new github.RepositoryRuleset(
  "branchCreationRestriction",
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
        includes: ["~ALL"],
      },
    },
    enforcement: "active",
    name: "branch creation restriction",
    repository: repository.name,
    rules: {
      creation: true,
    },
    target: "branch",
  },
  {
    protect: true,
  },
);
