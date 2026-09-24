import type * as github from "@pulumi/github";

// GitHub's standard built-in repository role IDs are fixed across all repositories;
// 5 is the Admin role.
const GitHubAdminRepositoryRoleBypassActor: github.types.input.RepositoryRulesetBypassActor = {
  actorId: 5,
  actorType: "RepositoryRole",
  bypassMode: "always",
};

export default GitHubAdminRepositoryRoleBypassActor;
