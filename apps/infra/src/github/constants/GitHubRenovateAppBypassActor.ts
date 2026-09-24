import type * as github from "@pulumi/github";

// Renovate (Mend) is a global GitHub App with the fixed app id 2740, identical across
// Every installation, so Renovate can keep opening its dependency-update branches/PRs.
const GitHubRenovateAppBypassActor: github.types.input.RepositoryRulesetBypassActor = {
  actorId: 2740,
  actorType: "Integration",
  bypassMode: "always",
};

export default GitHubRenovateAppBypassActor;
