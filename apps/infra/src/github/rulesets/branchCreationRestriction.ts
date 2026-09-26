import GitHubAdminRepositoryRoleBypassActor from "#src/github/constants/GitHubAdminRepositoryRoleBypassActor";
import GitHubRenovateAppBypassActor from "#src/github/constants/GitHubRenovateAppBypassActor";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Restricts who may create branches. Rulesets cannot be bypassed by an individual user (only a role, team
// Or app), so the equivalent is restricting creation across all refs to the Admin repository role and the
// Renovate GitHub App, which must keep opening its dependency-update branches. `creation: true` only allows
// Bypass actors to create matching refs; existing branches and pushes to them are unaffected. `external/`
// Is left out so any collaborator may branch there: a branch's name then says whose it is, with no list to keep.
export const branchCreationRestriction: github.RepositoryRuleset = new github.RepositoryRuleset(
  "branchCreationRestriction",
  {
    bypassActors: [GitHubAdminRepositoryRoleBypassActor, GitHubRenovateAppBypassActor],
    conditions: { refName: { excludes: ["refs/heads/external/**"], includes: ["~ALL"] } },
    enforcement: "active",
    name: "branch creation restriction",
    repository: repository.name,
    rules: { creation: true },
    target: "branch",
  },
  { protect: true },
);
