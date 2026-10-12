import GitHubAdminRepositoryRoleBypassActor from "#src/github/constants/GitHubAdminRepositoryRoleBypassActor";
import GitHubRenovateAppBypassActor from "#src/github/constants/GitHubRenovateAppBypassActor";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Everything under `ai/` refuses every push but the Admin repository role's, which every session and the review
// workflow act as. Renovate is a bypass actor so its pull requests can merge into `ai/queue`; it writes no other
// `ai/` ref. `main` is outside this ruleset: it is moved only by the review, and mainProtection restricts it.
export const oneWriterRefs: github.RepositoryRuleset = new github.RepositoryRuleset(
  "oneWriterRefs",
  {
    bypassActors: [GitHubAdminRepositoryRoleBypassActor, GitHubRenovateAppBypassActor],
    conditions: { refName: { excludes: [], includes: ["refs/heads/ai/**"] } },
    enforcement: "active",
    name: "one-writer refs",
    repository: repository.name,
    rules: { deletion: true, update: true },
    target: "branch",
  },
  { protect: true },
);
