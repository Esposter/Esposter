import GitHubAdminRepositoryRoleActorId from "#src/github/constants/GitHubAdminRepositoryRoleActorId";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Everything under `ai/` — the queue and the fixes branch — refuses every push but the Admin repository role's,
// Which the working session and the collector both act as. Renovate is no bypass actor here: it writes its own
// Branches and `main`, never a pipeline ref. `develop` and `main` are restricted the same way in
// `developMainProtection`, whose bypass list Renovate's branch automerge needs.
export const oneWriterRefs: github.RepositoryRuleset = new github.RepositoryRuleset(
  "oneWriterRefs",
  {
    bypassActors: [
      {
        actorId: GitHubAdminRepositoryRoleActorId,
        actorType: "RepositoryRole",
        bypassMode: "always",
      },
    ],
    conditions: {
      refName: {
        excludes: [],
        includes: ["refs/heads/ai/**"],
      },
    },
    enforcement: "active",
    name: "one-writer refs",
    repository: repository.name,
    rules: {
      deletion: true,
      update: true,
    },
    target: "branch",
  },
  {
    protect: true,
  },
);
